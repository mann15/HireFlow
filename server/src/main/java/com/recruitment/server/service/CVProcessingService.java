package com.recruitment.server.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.util.Base64;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class CVProcessingService {

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;

    @Value("${cloudinary.api_key:}")
    private String apiKey;

    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    @Value("${gemini.api.url:}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public CVUploadResult processAndUpload(MultipartFile file, Long candidateId, Long positionId) throws IOException {
        CVUploadResult result = new CVUploadResult();

        // Try PDF extraction first (if PDF)
        String extractedText = "";
        try {
            String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
            if (contentType.contains("pdf") || (file.getOriginalFilename() != null
                    && file.getOriginalFilename().toLowerCase().endsWith(".pdf"))) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    extractedText = stripper.getText(document);
                }
            } else if ((file.getOriginalFilename() != null
                    && file.getOriginalFilename().toLowerCase().endsWith(".docx"))
                    || (contentType.contains("word") && file.getOriginalFilename() != null
                            && file.getOriginalFilename().toLowerCase().endsWith(".docx"))) {
                // DOCX extraction using Apache POI
                try (java.io.InputStream is = file.getInputStream();
                        org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(
                                is);
                        org.apache.poi.xwpf.extractor.XWPFWordExtractor extractor = new org.apache.poi.xwpf.extractor.XWPFWordExtractor(
                                doc)) {
                    extractedText = extractor.getText();
                }
            } else if ((file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".doc"))
                    || (contentType.contains("msword"))) {
                // Legacy .doc files are less common; fall back to byte->string and let the
                // Gemini file fallback handle parsing if needed.
                byte[] bytes = file.getBytes();
                extractedText = new String(bytes, StandardCharsets.UTF_8);
            } else {
                // Try a simple UTF-8 decode for other types
                byte[] bytes = file.getBytes();
                extractedText = new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            System.err.println("PDF extraction failed: " + e.getMessage());
            extractedText = "";
        }

        result.setExtractedText(extractedText != null ? extractedText : "");

        // Log extracted text for debugging (truncate to 2000 chars)
        try {
            if (result.getExtractedText() != null && !result.getExtractedText().isBlank()) {
                String preview = result.getExtractedText().length() > 2000
                        ? result.getExtractedText().substring(0, 2000) + "..."
                        : result.getExtractedText();
                log.info("Extracted text length={}\nPreview:\n{}", result.getExtractedText().length(), preview);
            } else {
                log.info("No extracted text from file {}", file.getOriginalFilename());
            }
        } catch (Exception e) {
            log.warn("Failed to log extracted text: {}", e.getMessage());
        }

        // If Gemini endpoint/key provided, call it to get structured JSON
        if (geminiApiUrl != null && !geminiApiUrl.isBlank() && geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String structured = callGeminiApi(extractedText);
                result.setExtractedJson(structured);
                // Log Gemini structured response preview
                try {
                    if (structured != null && !structured.isBlank()) {
                        String sPreview = structured.length() > 2000 ? structured.substring(0, 2000) + "..."
                                : structured;
                        log.info("Gemini structured response length={}\nPreview:\n{}", structured.length(), sPreview);
                    }
                } catch (Exception e) {
                    log.warn("Failed to log Gemini response: {}", e.getMessage());
                }
            } catch (Exception e) {
                // Log and continue with raw extracted text
                log.warn("Failed to call Gemini API: {}", e.getMessage());
            }
        }

        // If extraction failed or produced very little text, fallback to sending the
        // whole file to Gemini
        if ((result.getExtractedText() == null || result.getExtractedText().trim().length() < 50)
                && geminiApiUrl != null && !geminiApiUrl.isBlank() && geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String geminiResponse = callGeminiWithFile(file);
                result.setExtractedJson(geminiResponse);
            } catch (Exception e) {
                System.err.println("Gemini file fallback failed: " + e.getMessage());
            }
        }

        // Upload to Cloudinary if configured
        if (cloudName != null && !cloudName.isBlank() && apiKey != null && !apiKey.isBlank() && apiSecret != null
                && !apiSecret.isBlank()) {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));

            try {
                byte[] bytes = file.getBytes();
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(bytes,
                        ObjectUtils.asMap("resource_type", "auto", "folder", "hireflow/cvs", "public_id",
                                "candidate_" + candidateId + "_pos_" + positionId + "_" + System.currentTimeMillis()));

                result.setCloudPublicId((String) uploadResult.get("public_id"));
                result.setCloudUrl((String) uploadResult.get("secure_url"));
            } catch (Exception e) {
                throw new IOException("Failed to upload to Cloudinary: " + e.getMessage(), e);
            }
        }

        return result;
    }

    // Removed Tika-based extraction; using simple byte->string fallback in
    // processAndUpload.

    private String callGeminiApi(String text) throws Exception {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
        // Compose a clear instruction so the Gemini model returns a compact JSON
        // structure
        String instruction = "You are a resume parser. Given the raw extracted resume text, return a single JSON object with the following fields when available:\n"
                + "firstName, lastName, email, phone, totalExperience, currentSalary, expectedSalary, noticePeriod, currentLocation, preferredLocation, linkedinUrl, githubUrl, portfolioUrl, skills (array of strings), education (array of objects with degree, institution, startYear, endYear), workExperience (array of objects with title, company, startYear, endYear, description).\n"
                + "Return only valid JSON and nothing else. If a field is not present, omit it or set it to null. Keep numeric values as numbers. Do not include explanatory text.\n\nResume text:\n"
                + text;

        ObjectMapper om = new ObjectMapper();
        ObjectNode body = om.createObjectNode();
        body.put("prompt", instruction);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(geminiApiUrl))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + geminiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("Gemini API error: " + response.statusCode() + " " + response.body());
        }
    }

    private String callGeminiWithFile(org.springframework.web.multipart.MultipartFile file) throws Exception {
        if (geminiApiUrl == null || geminiApiUrl.isBlank() || geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("Gemini API not configured");
        }

        byte[] bytes = file.getBytes();
        String b64 = Base64.getEncoder().encodeToString(bytes);

        ObjectMapper om = new ObjectMapper();
        ObjectNode payload = om.createObjectNode();
        payload.put("filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.dat");
        payload.put("contentBase64", b64);

        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(geminiApiUrl))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + geminiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("Gemini API file upload error: " + response.statusCode() + " " + response.body());
        }
    }

    @Data
    public static class CVUploadResult {
        private String cloudPublicId;
        private String cloudUrl;
        private String extractedText;
        private String extractedJson;
    }
}
