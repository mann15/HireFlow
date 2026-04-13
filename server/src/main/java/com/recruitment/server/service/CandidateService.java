package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateService {

        private final CandidateRepository candidateRepository;
        private final CandidateCVRepository candidateCVRepository;
        private final CandidateSkillsRepository candidateSkillsRepository;
        private final SkillsRepository skillsRepository;
        private final ProficiencyLevelsRepository proficiencyLevelsRepository;
        private final JobSkillsRequiredRepository jobSkillsRequiredRepository;
        private final JobRepository jobRepository;
        private final JobApplicationRepository jobApplicationRepository;
        private final CVProcessingService cvProcessingService;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final EmailService emailService;
        private final PasswordResetTokenRepository passwordResetTokenRepository;

        // Local upload directory was removed in favor of Cloudinary when configured

        // Create candidate profile manually
        public Candidate createCandidate(Candidate candidate) {
                candidate.setCreatedAt(LocalDateTime.now());
                candidate.setUpdatedAt(LocalDateTime.now());

                // Create user account for candidate
                if (candidate.getEmail() != null && !candidate.getEmail().isEmpty()) {
                        User user = User.builder()
                                        .email(candidate.getEmail())
                                        .password(passwordEncoder.encode("1234"))
                                        .firstName(candidate.getFirstName())
                                        .lastName(candidate.getLastName())
                                        .phone(candidate.getPhone())
                                        .isActive(true)
                                        .requiresPasswordChange(true)
                                        .createdAt(LocalDateTime.now())
                                        .updatedAt(LocalDateTime.now())
                                        .build();

                        // Set CANDIDATE role (create if not exists)
                        user.setRole(getCandidateRole());

                        User savedUser = userRepository.save(user);
                        candidate.setUser(savedUser);
                }

                return candidateRepository.save(candidate);
        }

        // Helper: Get or create CANDIDATE role
        private Role getCandidateRole() {
                Role candidateRole = roleRepository.findByRoleName("CANDIDATE");
                if (candidateRole == null) {
                        candidateRole = Role.builder().roleName("CANDIDATE").build();
                        candidateRole = roleRepository.save(candidateRole);
                }
                return candidateRole;
        }

        // Helper: extract email from raw text
        private String extractEmailFromText(String text) {
                if (text == null)
                        return null;
                Pattern p = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
                                Pattern.CASE_INSENSITIVE);
                Matcher m = p.matcher(text);
                if (m.find())
                        return m.group().trim();
                return null;
        }

        // Helper: extract phone-like number from raw text
        private String extractPhoneFromText(String text) {
                if (text == null)
                        return null;
                // find sequences that look like phone numbers
                Pattern p = Pattern.compile("(\\+?\\d[\\d\\s\\-().]{7,}\\d)");
                Matcher m = p.matcher(text);
                while (m.find()) {
                        String candidate = m.group(1).replaceAll("[^0-9+]", "");
                        String digitsOnly = candidate.replaceAll("[^0-9]", "");
                        if (digitsOnly.length() >= 8 && digitsOnly.length() <= 15) {
                                return candidate;
                        }
                }
                return null;
        }

        // Helper: attempt to find a name near the top of the document
        private String[] extractNameFromText(String text) {
                if (text == null)
                        return null;
                String[] lines = text.split("\\r?\\n");
                int limit = Math.min(lines.length, 8);
                Pattern namePattern = Pattern.compile("^[A-Z][a-z]+(\\s+[A-Z][a-z]+){0,3}$");
                for (int i = 0; i < limit; i++) {
                        String l = lines[i].trim();
                        if (l.length() > 2 && l.length() < 60 && l.split("\\s+").length <= 4) {
                                Matcher m = namePattern.matcher(l);
                                if (m.find()) {
                                        String[] parts = l.split("\\s+", 2);
                                        if (parts.length == 1)
                                                return new String[] { parts[0], "" };
                                        return new String[] { parts[0], parts[1] };
                                }
                        }
                }
                return null;
        }

        // Helper: find a URL by keyword (e.g., linkedin.com, github.com)
        private String extractUrlByKeyword(String text, String keyword) {
                if (text == null || keyword == null)
                        return null;
                Pattern p = Pattern.compile("https?://[\\S]*" + Pattern.quote(keyword) + "[\\S]*",
                                Pattern.CASE_INSENSITIVE);
                Matcher m = p.matcher(text);
                if (m.find())
                        return m.group().trim();
                // try without protocol
                p = Pattern.compile("[\\S]*" + Pattern.quote(keyword) + "[\\S]*", Pattern.CASE_INSENSITIVE);
                m = p.matcher(text);
                if (m.find()) {
                        String out = m.group().trim();
                        if (!out.startsWith("http"))
                                out = "https://" + out;
                        return out;
                }
                return null;
        }

        // Helper: extract a list of skills from the text using simple heuristics
        private List<String> extractSkillsFromText(String text) {
                if (text == null)
                        return Collections.emptyList();
                // Try to find a 'Skills' section first
                String skillsSection = extractSectionByHeadings(text,
                                Arrays.asList("Skills", "SKILLS", "Technical Skills", "TECHNICAL SKILLS"));
                String candidate = skillsSection != null ? skillsSection : text;

                // Break into tokens by common separators
                String[] parts = candidate.split("[\\n\\r]+|;|/|\\\\|\\t");
                List<String> found = new ArrayList<>();
                for (String part : parts) {
                        // If we used section extraction, split by commas inside that section
                        String[] tokens = part.split(",|/|\\\\|\\(|\\)");
                        for (String t : tokens) {
                                String s = t.trim();
                                if (s.length() < 2 || s.length() > 60)
                                        continue;
                                // filter out lines that look like headings or contact info
                                if (s.toLowerCase().contains("@") || s.matches(".*\\d.*"))
                                        continue;
                                if (s.matches("(?i).*(education|experience|work|projects|summary|objective).*"))
                                        continue;
                                // discard very generic words
                                if (s.equalsIgnoreCase("skills") || s.equalsIgnoreCase("technical"))
                                        continue;
                                // simple normalization: remove bullet characters
                                s = s.replaceAll("^[\\-\\u2022\\*\\s]+", "");
                                s = s.replaceAll("[\\u2022\\-]+$", "");
                                if (s.split(" ").length > 0 && !found.contains(s))
                                        found.add(s);
                        }
                }
                // Heuristic: limit to top ~40 skills
                return found.stream().limit(40).collect(Collectors.toList());
        }

        // Helper: extract a section following common headings (Education, Experience,
        // Skills, etc.)
        private String extractSectionByHeadings(String text, List<String> headings) {
                if (text == null)
                        return null;
                String[] lines = text.split("\\r?\\n");
                for (int i = 0; i < lines.length; i++) {
                        String line = lines[i].trim();
                        for (String h : headings) {
                                if (line.equalsIgnoreCase(h) || line.toLowerCase().startsWith(h.toLowerCase() + ":")) {
                                        // collect following lines until next blank line or next all-caps heading
                                        StringBuilder sb = new StringBuilder();
                                        for (int j = i + 1; j < lines.length; j++) {
                                                String ln = lines[j];
                                                if (ln.trim().isEmpty())
                                                        break;
                                                // stop at common next-section cues
                                                if (ln.trim().matches("^[A-Z][A-Z \\\t0-9/-]{2,}$")
                                                                && ln.trim().length() < 60)
                                                        break;
                                                sb.append(ln).append("\n");
                                        }
                                        return sb.toString().trim();
                                }
                        }
                }
                return null;
        }

        // Upload CV for candidate (uploads to Cloudinary when configured; also extracts
        // CV data and optionally creates application)
        public Map<String, Object> uploadCV(Long candidateId, Long positionId, MultipartFile file) throws IOException {
                Map<String, Object> resp = new HashMap<>();
                Candidate candidate = candidateRepository.findById(candidateId)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                JobPosition position = null;
                if (positionId != null) {
                        position = jobRepository.findById(positionId)
                                        .orElseThrow(() -> new RuntimeException("Position not found"));
                }

                // Use CVProcessingService to upload and extract
                CVProcessingService.CVUploadResult uploadResult = cvProcessingService.processAndUpload(file,
                                candidateId, positionId);

                // Build CV record (position is optional for this upload path)
                CandidateCV candidateCV = CandidateCV.builder()
                                .candidate(candidate)
                                .positionId(position)
                                .cvFilePath(uploadResult.getCloudUrl() != null ? uploadResult.getCloudUrl()
                                                : "uploaded_local")
                                .cloudPublicId(uploadResult.getCloudPublicId())
                                .cloudUrl(uploadResult.getCloudUrl())
                                .extractedData(uploadResult.getExtractedJson() != null ? uploadResult.getExtractedJson()
                                                : uploadResult.getExtractedText())
                                .fileName(file.getOriginalFilename())
                                .uploadedAt(LocalDateTime.now())
                                .build();

                CandidateCV savedCv = candidateCVRepository.save(candidateCV);

                // Put candidate and cv into response map
                resp.put("cv", savedCv);
                resp.put("candidate", candidate);

                // If extracted data exists, try to create or update a Candidate profile
                // automatically (best-effort) and create application linking candidate,
                // position and cv
                try {
                        String extractedJson = uploadResult.getExtractedJson();
                        String extractedText = uploadResult.getExtractedText();
                        Map<String, Object> parsed = null;

                        if (extractedJson != null && !extractedJson.isBlank()) {
                                try {
                                        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                                        com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>> tr = new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {
                                        };
                                        parsed = om.readValue(extractedJson, tr);
                                } catch (Exception ignore) {
                                        // not JSON, ignore
                                }
                        }

                        // If parsed is null but we have extractedText, we can try to do a naive parse
                        // (not implemented) or skip
                        if (parsed != null && !parsed.isEmpty()) {
                                // Try to find existing candidate by email
                                String email = parsed.get("email") != null ? parsed.get("email").toString() : null;
                                Candidate candidateObj = null;
                                if (email != null && !email.isBlank()) {
                                        candidateObj = candidateRepository.findByEmail(email).orElse(null);
                                }

                                // If Gemini JSON was sparse, try extracting common fields from raw text
                                String rawText = extractedText != null ? extractedText : "";
                                if (parsed.get("email") == null) {
                                        String foundEmail = extractEmailFromText(rawText);
                                        if (foundEmail != null)
                                                parsed.put("email", foundEmail);
                                }
                                if (parsed.get("phone") == null) {
                                        String foundPhone = extractPhoneFromText(rawText);
                                        if (foundPhone != null)
                                                parsed.put("phone", foundPhone);
                                }
                                if ((parsed.get("firstName") == null || parsed.get("lastName") == null)
                                                && (parsed.get("name") == null)) {
                                        String[] nameParts = extractNameFromText(rawText);
                                        if (nameParts != null) {
                                                parsed.put("firstName", nameParts[0]);
                                                if (nameParts.length > 1)
                                                        parsed.put("lastName", nameParts[1]);
                                        }
                                }

                                if (parsed.get("linkedinUrl") == null) {
                                        String ln = extractUrlByKeyword(rawText, "linkedin.com");
                                        if (ln != null)
                                                parsed.put("linkedinUrl", ln);
                                }
                                if (parsed.get("githubUrl") == null) {
                                        String gh = extractUrlByKeyword(rawText, "github.com");
                                        if (gh != null)
                                                parsed.put("githubUrl", gh);
                                }

                                if (candidateObj == null) {
                                        Candidate newCand = Candidate.builder()
                                                        .firstName(parsed.get("firstName") != null
                                                                        ? parsed.get("firstName").toString()
                                                                        : (parsed.get("name") != null
                                                                                        ? parsed.get("name").toString()
                                                                                        : null))
                                                        .lastName(parsed.get("lastName") != null
                                                                        ? parsed.get("lastName").toString()
                                                                        : null)
                                                        .email(email)
                                                        .phone(parsed.get("phone") != null
                                                                        ? parsed.get("phone").toString()
                                                                        : null)
                                                        .currentLocation(parsed.get("currentLocation") != null
                                                                        ? parsed.get("currentLocation").toString()
                                                                        : null)
                                                        .preferredLocation(parsed.get("preferredLocation") != null
                                                                        ? parsed.get("preferredLocation").toString()
                                                                        : null)
                                                        .linkedinUrl(parsed.get("linkedinUrl") != null
                                                                        ? parsed.get("linkedinUrl").toString()
                                                                        : null)
                                                        .githubUrl(parsed.get("githubUrl") != null
                                                                        ? parsed.get("githubUrl").toString()
                                                                        : null)
                                                        .portfolioUrl(parsed.get("portfolioUrl") != null
                                                                        ? parsed.get("portfolioUrl").toString()
                                                                        : null)
                                                        .createdAt(LocalDateTime.now())
                                                        .updatedAt(LocalDateTime.now())
                                                        .isActive(true)
                                                        .build();

                                        // numeric fields
                                        try {
                                                if (parsed.get("totalExperience") != null)
                                                        newCand.setTotalExperience(new java.math.BigDecimal(
                                                                        parsed.get("totalExperience").toString()));
                                                if (parsed.get("currentSalary") != null)
                                                        newCand.setCurrentSalary(new java.math.BigDecimal(
                                                                        parsed.get("currentSalary").toString()));
                                                if (parsed.get("expectedSalary") != null)
                                                        newCand.setExpectedSalary(new java.math.BigDecimal(
                                                                        parsed.get("expectedSalary").toString()));
                                                if (parsed.get("noticePeriod") != null)
                                                        newCand.setNoticePeriod(Integer.parseInt(
                                                                        parsed.get("noticePeriod").toString()));
                                        } catch (Exception ignored) {
                                        }

                                        candidateObj = candidateRepository.save(newCand);
                                } else {
                                        // update some fields if missing
                                        boolean changed = false;
                                        if (candidateObj.getFirstName() == null && parsed.get("firstName") != null) {
                                                candidateObj.setFirstName(parsed.get("firstName").toString());
                                                changed = true;
                                        }
                                        if (candidateObj.getLastName() == null && parsed.get("lastName") != null) {
                                                candidateObj.setLastName(parsed.get("lastName").toString());
                                                changed = true;
                                        }
                                        if (changed)
                                                candidateRepository.save(candidateObj);
                                }

                                if (candidateObj != null) {
                                        // link CV to candidate if not already
                                        savedCv.setCandidate(candidateObj);
                                        candidateCVRepository.save(savedCv);
                                        // create application linking candidate, position and cv
                                        if (position != null) {
                                                JobApplication application = JobApplication.builder()
                                                                .candidate(candidateObj)
                                                                .position(position)
                                                                .cv(savedCv)
                                                                .status(JobApplication.Status.APPLIED)
                                                                .build();
                                                JobApplication savedApp = jobApplicationRepository.save(application);
                                                resp.put("application", savedApp);
                                        }

                                        // If parsed JSON contained skills array, try to map to existing Skills and save
                                        // CandidateSkills
                                        try {
                                                if (parsed.get("skills") instanceof java.util.Collection) {
                                                        @SuppressWarnings("unchecked")
                                                        java.util.Collection<Object> skillsList = (java.util.Collection<Object>) parsed
                                                                        .get("skills");
                                                        ProficiencyLevels defaultLevel = proficiencyLevelsRepository
                                                                        .findByLevelName("Intermediate");
                                                        if (defaultLevel == null) {
                                                                java.util.List<ProficiencyLevels> levels = proficiencyLevelsRepository
                                                                                .findAll();
                                                                defaultLevel = levels.isEmpty() ? null : levels.get(0);
                                                        }

                                                        for (Object sObj : skillsList) {
                                                                try {
                                                                        String skillName = sObj.toString();
                                                                        Skills skill = skillsRepository
                                                                                        .findBySkillNameIgnoreCase(
                                                                                                        skillName);
                                                                        if (skill != null && defaultLevel != null) {
                                                                                CandidateSkills cs = CandidateSkills
                                                                                                .builder()
                                                                                                .candidate(candidateObj)
                                                                                                .skill(skill)
                                                                                                .proficiencyLevel(
                                                                                                                defaultLevel)
                                                                                                .verified(false)
                                                                                                .build();
                                                                                candidateSkillsRepository.save(cs);
                                                                        }
                                                                } catch (Exception ignore) {
                                                                }
                                                        }
                                                }
                                        } catch (Exception e) {
                                                // swallow skill mapping errors
                                        }
                                }
                        }
                } catch (Exception e) {
                        System.err.println("Failed to auto-create candidate/application from extracted data: "
                                        + e.getMessage());
                }

                return resp;
        }

        // Create candidate (or update if email exists) and records from an uploaded CV
        // file
        public Map<String, Object> createCandidateFromCV(MultipartFile file, Long positionId) throws IOException {
                Map<String, Object> resp = new HashMap<>();

                JobPosition position = null;
                if (positionId != null) {
                        position = jobRepository.findById(positionId)
                                        .orElseThrow(() -> new RuntimeException("Position not found"));
                }

                CVProcessingService.CVUploadResult uploadResult = cvProcessingService.processAndUpload(file, null,
                                positionId);

                // Try to parse JSON
                Map<String, Object> parsed = null;
                try {
                        if (uploadResult.getExtractedJson() != null && !uploadResult.getExtractedJson().isBlank()) {
                                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                                com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>> tr = new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {
                                };
                                parsed = om.readValue(uploadResult.getExtractedJson(), tr);
                        }
                } catch (Exception e) {
                        // ignore
                }

                // Ensure parsed map exists and attempt to populate missing fields from raw
                // extracted text
                if (parsed == null)
                        parsed = new HashMap<>();
                String rawText = uploadResult.getExtractedText() != null ? uploadResult.getExtractedText() : "";

                if (parsed.get("email") == null) {
                        String email = extractEmailFromText(rawText);
                        if (email != null)
                                parsed.put("email", email);
                }
                if (parsed.get("phone") == null) {
                        String phone = extractPhoneFromText(rawText);
                        if (phone != null)
                                parsed.put("phone", phone);
                }
                if ((parsed.get("firstName") == null || parsed.get("lastName") == null) && parsed.get("name") == null) {
                        String[] nameParts = extractNameFromText(rawText);
                        if (nameParts != null) {
                                parsed.put("firstName", nameParts[0]);
                                if (nameParts.length > 1)
                                        parsed.put("lastName", nameParts[1]);
                        }
                }
                if (parsed.get("linkedinUrl") == null) {
                        String ln = extractUrlByKeyword(rawText, "linkedin.com");
                        if (ln != null)
                                parsed.put("linkedinUrl", ln);
                }
                if (parsed.get("githubUrl") == null) {
                        String gh = extractUrlByKeyword(rawText, "github.com");
                        if (gh != null)
                                parsed.put("githubUrl", gh);
                }

                if (parsed.get("skills") == null) {
                        List<String> skills = extractSkillsFromText(rawText);
                        if (!skills.isEmpty())
                                parsed.put("skills", skills);
                }

                if (parsed.get("education") == null && parsed.get("educationText") == null) {
                        String edu = extractSectionByHeadings(rawText,
                                        Arrays.asList("Education", "EDUCATION", "Education"));
                        if (edu != null && !edu.isBlank())
                                parsed.put("educationText", edu);
                }

                Candidate candidateObj = null;
                String parsedEmail = null;
                if (parsed != null && parsed.get("email") != null) {
                        parsedEmail = parsed.get("email").toString();
                        candidateObj = candidateRepository.findByEmail(parsedEmail).orElse(null);
                }

                if (candidateObj == null) {
                        // Ensure required non-null fields have safe defaults
                        String firstName = parsed != null && parsed.get("firstName") != null
                                        ? parsed.get("firstName").toString()
                                        : "";
                        String lastName = parsed != null && parsed.get("lastName") != null
                                        ? parsed.get("lastName").toString()
                                        : "";
                        String email = parsedEmail != null && !parsedEmail.isBlank() ? parsedEmail
                                        : "candidate+" + System.currentTimeMillis() + "@example.local";

                        Candidate newCand = Candidate.builder()
                                        .firstName(firstName)
                                        .lastName(lastName)
                                        .email(email)
                                        .phone(parsed != null && parsed.get("phone") != null
                                                        ? parsed.get("phone").toString()
                                                        : null)
                                        .currentLocation(parsed != null && parsed.get("currentLocation") != null
                                                        ? parsed.get("currentLocation").toString()
                                                        : null)
                                        .preferredLocation(parsed != null && parsed.get("preferredLocation") != null
                                                        ? parsed.get("preferredLocation").toString()
                                                        : null)
                                        .linkedinUrl(parsed != null && parsed.get("linkedinUrl") != null
                                                        ? parsed.get("linkedinUrl").toString()
                                                        : null)
                                        .githubUrl(parsed != null && parsed.get("githubUrl") != null
                                                        ? parsed.get("githubUrl").toString()
                                                        : null)
                                        .portfolioUrl(parsed != null && parsed.get("portfolioUrl") != null
                                                        ? parsed.get("portfolioUrl").toString()
                                                        : null)
                                        .createdAt(LocalDateTime.now())
                                        .updatedAt(LocalDateTime.now())
                                        .isActive(true)
                                        .build();

                        try {
                                if (parsed != null && parsed.get("totalExperience") != null)
                                        newCand.setTotalExperience(new java.math.BigDecimal(
                                                        parsed.get("totalExperience").toString()));
                                if (parsed != null && parsed.get("currentSalary") != null)
                                        newCand.setCurrentSalary(new java.math.BigDecimal(
                                                        parsed.get("currentSalary").toString()));
                                if (parsed != null && parsed.get("expectedSalary") != null)
                                        newCand.setExpectedSalary(new java.math.BigDecimal(
                                                        parsed.get("expectedSalary").toString()));
                                if (parsed != null && parsed.get("noticePeriod") != null)
                                        newCand.setNoticePeriod(
                                                        Integer.parseInt(parsed.get("noticePeriod").toString()));
                        } catch (Exception ignored) {
                        }

                        candidateObj = candidateRepository.save(newCand);

                        // Create user account for candidate from CV
                        if (email != null && !email.isEmpty() && !email.contains("example.local")) {
                                User user = User.builder()
                                                .email(email)
                                                .password(passwordEncoder.encode("1234"))
                                                .firstName(firstName)
                                                .lastName(lastName)
                                                .phone(parsed != null && parsed.get("phone") != null
                                                                ? parsed.get("phone").toString()
                                                                : null)
                                                .isActive(true)
                                                .requiresPasswordChange(true)
                                                .createdAt(LocalDateTime.now())
                                                .updatedAt(LocalDateTime.now())
                                                .build();

                                // Set CANDIDATE role (create if not exists)
                                user.setRole(getCandidateRole());
                                User savedUser = userRepository.save(user);
                                candidateObj.setUser(savedUser);
                                candidateObj = candidateRepository.save(candidateObj);
                        }
                }

                // Create CV record
                CandidateCV.CandidateCVBuilder cvBuilder = CandidateCV.builder()
                                .candidate(candidateObj)
                                .cvFilePath(uploadResult.getCloudUrl() != null ? uploadResult.getCloudUrl()
                                                : "uploaded_local")
                                .cloudPublicId(uploadResult.getCloudPublicId())
                                .cloudUrl(uploadResult.getCloudUrl())
                                .extractedData(uploadResult.getExtractedJson() != null ? uploadResult.getExtractedJson()
                                                : uploadResult.getExtractedText())
                                .fileName(file.getOriginalFilename())
                                .uploadedAt(LocalDateTime.now());

                if (position != null)
                        cvBuilder.positionId(position);

                CandidateCV savedCv = candidateCVRepository.save(cvBuilder.build());

                JobApplication savedApp = null;
                // If a position was provided, create the JobApplication linking candidate,
                // position and cv
                if (position != null) {
                        JobApplication application = JobApplication.builder()
                                        .candidate(candidateObj)
                                        .position(position)
                                        .cv(savedCv)
                                        .status(JobApplication.Status.APPLIED)
                                        .build();
                        savedApp = jobApplicationRepository.save(application);
                }

                resp.put("candidate", candidateObj);
                resp.put("cv", savedCv);
                resp.put("application", savedApp);

                return resp;
        }

        // Extracts candidate info from CV without saving to DB
        public Map<String, Object> extractCandidateInfoFromCV(MultipartFile file) throws IOException {
                Map<String, Object> resp = new HashMap<>();

                CVProcessingService.CVUploadResult uploadResult = cvProcessingService.processAndUpload(file, null, null);

                // Try to parse JSON
                Map<String, Object> parsed = null;
                try {
                        if (uploadResult.getExtractedJson() != null && !uploadResult.getExtractedJson().isBlank()) {
                                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                                com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>> tr = new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {};
                                parsed = om.readValue(uploadResult.getExtractedJson(), tr);
                        }
                } catch (Exception e) {
                        // ignore
                }

                if (parsed == null)
                        parsed = new HashMap<>();
                
                String rawText = uploadResult.getExtractedText() != null ? uploadResult.getExtractedText() : "";

                if (parsed.get("email") == null) {
                        String email = extractEmailFromText(rawText);
                        if (email != null) parsed.put("email", email);
                }
                if (parsed.get("phone") == null) {
                        String phone = extractPhoneFromText(rawText);
                        if (phone != null) parsed.put("phone", phone);
                }
                if ((parsed.get("firstName") == null || parsed.get("lastName") == null) && parsed.get("name") == null) {
                        String[] nameParts = extractNameFromText(rawText);
                        if (nameParts != null) {
                                parsed.put("firstName", nameParts[0]);
                                if (nameParts.length > 1) parsed.put("lastName", nameParts[1]);
                        }
                }
                if (parsed.get("linkedinUrl") == null) {
                        String ln = extractUrlByKeyword(rawText, "linkedin.com");
                        if (ln != null) parsed.put("linkedinUrl", ln);
                }
                if (parsed.get("githubUrl") == null) {
                        String gh = extractUrlByKeyword(rawText, "github.com");
                        if (gh != null) parsed.put("githubUrl", gh);
                }
                if (parsed.get("skills") == null) {
                        List<String> skills = extractSkillsFromText(rawText);
                        if (!skills.isEmpty()) parsed.put("skills", skills);
                }

                // Return the parsed data along with the file metadata so it can be associated later
                resp.put("extractedData", parsed);
                resp.put("cloudUrl", uploadResult.getCloudUrl());
                resp.put("cloudPublicId", uploadResult.getCloudPublicId());
                resp.put("extractedRawText", uploadResult.getExtractedText());
                resp.put("extractedJsonText", uploadResult.getExtractedJson());

                return resp;
        }

        // Bulk upload candidates from Excel
        @Transactional(propagation = Propagation.NOT_SUPPORTED)
        public List<Candidate> bulkUploadCandidates(List<Map<String, Object>> candidateData) {
                List<Candidate> candidates = new ArrayList<>();

                for (Map<String, Object> data : candidateData) {
                        try {
                                Candidate candidate = Candidate.builder()
                                                .email(asString(data.get("email")))
                                                .firstName(asString(data.get("firstName")))
                                                .lastName(asString(data.get("lastName")))
                                                .phone(asString(data.get("phone")))
                                                .currentLocation(asString(data.get("currentLocation")))
                                                .preferredLocation(asString(data.get("preferredLocation")))
                                                .totalExperience(parseBigDecimal(data.get("totalExperience")))
                                                .currentSalary(parseBigDecimal(data.get("currentSalary")))
                                                .expectedSalary(parseBigDecimal(data.get("expectedSalary")))
                                                .noticePeriod(parseInteger(data.get("noticePeriod")))
                                                .source(parseSource(data.get("source")))
                                                .sourceDetails(asString(data.get("sourceDetails")))
                                                .linkedinUrl(asString(data.get("linkedinUrl")))
                                                .githubUrl(asString(data.get("githubUrl")))
                                                .portfolioUrl(asString(data.get("portfolioUrl")))
                                                .createdAt(LocalDateTime.now())
                                                .updatedAt(LocalDateTime.now())
                                                .build();

                                // Create user account for bulk uploaded candidate
                                String email = asString(data.get("email"));
                                if (email != null && !email.isEmpty()) {
                                        User user = User.builder()
                                                        .email(email)
                                                        .password(passwordEncoder.encode("1234"))
                                                        .firstName(asString(data.get("firstName")))
                                                        .lastName(asString(data.get("lastName")))
                                                        .phone(asString(data.get("phone")))
                                                        .isActive(true)
                                                        .requiresPasswordChange(true)
                                                        .createdAt(LocalDateTime.now())
                                                        .updatedAt(LocalDateTime.now())
                                                        .build();

                                        // Set CANDIDATE role (create if not exists)
                                        user.setRole(getCandidateRole());
                                        User savedUser = userRepository.save(user);
                                        candidate.setUser(savedUser);
                                }

                                candidates.add(candidateRepository.save(candidate));
                        } catch (Exception e) {
                                // Log error and continue with next candidate
                                System.err.println("Error processing candidate: " + e.getMessage());
                        }
                }

                return candidates;
        }

        private String asString(Object value) {
                return value != null ? value.toString() : null;
        }

        private BigDecimal parseBigDecimal(Object value) {
                try {
                        return value != null ? new BigDecimal(value.toString()) : null;
                } catch (Exception e) {
                        return null;
                }
        }

        private Integer parseInteger(Object value) {
                try {
                        return value != null ? Integer.parseInt(value.toString()) : null;
                } catch (Exception e) {
                        return null;
                }
        }

        private Candidate.Source parseSource(Object value) {
                try {
                        String src = value != null ? value.toString() : null;
                        return src != null ? Candidate.Source.valueOf(src.toUpperCase()) : Candidate.Source.OTHER;
                } catch (Exception e) {
                        return Candidate.Source.OTHER;
                }
        }

        // Add skills to candidate
        public CandidateSkills addCandidateSkill(Long candidateId, Long skillId, Long proficiencyLevelId,
                        BigDecimal yearsOfExperience) {
                Candidate candidate = candidateRepository.findById(candidateId)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                Skills skill = skillsRepository.findById(skillId)
                                .orElseThrow(() -> new RuntimeException("Skill not found"));

                ProficiencyLevels proficiencyLevel = proficiencyLevelsRepository.findById(proficiencyLevelId)
                                .orElseThrow(() -> new RuntimeException("Proficiency level not found"));

                CandidateSkills candidateSkill = CandidateSkills.builder()
                                .candidate(candidate)
                                .skill(skill)
                                .proficiencyLevel(proficiencyLevel)
                                .yearsOfExperience(yearsOfExperience)
                                .build();

                return candidateSkillsRepository.save(candidateSkill);
        }

        // Delete candidate's skill
        public void deleteCandidateSkillById(Long candidateSkillId) {
                candidateSkillsRepository.deleteById(candidateSkillId);
        }

        // Get all candidates
        public List<Candidate> getAllCandidates() {
                return candidateRepository.findByIsActiveTrue();
        }

        // Get candidate by ID
        public Optional<Candidate> getCandidateById(Long candidateId) {
                return candidateRepository.findById(candidateId);
        }

        // Search candidates by criteria
        public List<Candidate> searchCandidates(String name, String location, BigDecimal minExp,
                        BigDecimal maxExp, BigDecimal maxSalary, List<String> skills) {
                List<Candidate> candidates = candidateRepository.findByIsActiveTrue();

                if (name != null && !name.isEmpty()) {
                        candidates = candidates.stream()
                                        .filter(c -> c.getFirstName().toLowerCase().contains(name.toLowerCase()) ||
                                                        c.getLastName().toLowerCase().contains(name.toLowerCase()))
                                        .collect(Collectors.toList());
                }

                if (location != null && !location.isEmpty()) {
                        candidates = candidates.stream()
                                        .filter(c -> (c.getCurrentLocation() != null &&
                                                        c.getCurrentLocation().toLowerCase()
                                                                        .contains(location.toLowerCase()))
                                                        ||
                                                        (c.getPreferredLocation() != null &&
                                                                        c.getPreferredLocation().toLowerCase().contains(
                                                                                        location.toLowerCase())))
                                        .collect(Collectors.toList());
                }

                if (minExp != null) {
                        candidates = candidates.stream()
                                        .filter(c -> c.getTotalExperience().compareTo(minExp) >= 0)
                                        .collect(Collectors.toList());
                }

                if (maxExp != null) {
                        candidates = candidates.stream()
                                        .filter(c -> c.getTotalExperience().compareTo(maxExp) <= 0)
                                        .collect(Collectors.toList());
                }

                if (maxSalary != null) {
                        candidates = candidates.stream()
                                        .filter(c -> c.getExpectedSalary() != null &&
                                                        c.getExpectedSalary().compareTo(maxSalary) <= 0)
                                        .collect(Collectors.toList());
                }

                if (skills != null && !skills.isEmpty()) {
                        final Set<String> skillSet = skills.stream()
                                        .filter(Objects::nonNull)
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .map(String::toLowerCase)
                                        .collect(Collectors.toSet());

                        candidates = candidates.stream()
                                        .filter(c -> {
                                                List<CandidateSkills> cs = candidateSkillsRepository.findByCandidate(c);
                                                return cs.stream()
                                                                .anyMatch(s -> skillSet.contains(
                                                                                s.getSkill().getSkillName()
                                                                                                .toLowerCase()));
                                        })
                                        .collect(Collectors.toList());
                }

                return candidates;
        }

        // Find candidates matching job requirements
        public List<Candidate> findCandidatesForPosition(Long positionId) {
                JobPosition position = jobRepository.findById(positionId)
                                .orElseThrow(() -> new RuntimeException("Position not found"));

                // Get required skills for the position
                List<JobSkillsRequired> requiredSkills = jobSkillsRequiredRepository.findByPosition(position);
                List<String> skillNames = requiredSkills.stream()
                                .map(jsr -> jsr.getSkill().getSkillName())
                                .collect(Collectors.toList());

                // Find candidates with matching skills
                List<Candidate> candidates = candidateRepository.findBySkillsIn(skillNames);

                // Filter by experience range
                if (position.getExperienceRequiredMin() != null || position.getExperienceRequiredMax() != null) {
                        BigDecimal minExp = position.getExperienceRequiredMin() != null
                                        ? BigDecimal.valueOf(position.getExperienceRequiredMin())
                                        : BigDecimal.ZERO;
                        BigDecimal maxExp = position.getExperienceRequiredMax() != null
                                        ? BigDecimal.valueOf(position.getExperienceRequiredMax())
                                        : BigDecimal.valueOf(100);

                        candidates = candidates.stream()
                                        .filter(c -> c.getTotalExperience().compareTo(minExp) >= 0 &&
                                                        c.getTotalExperience().compareTo(maxExp) <= 0)
                                        .collect(Collectors.toList());
                }

                // Filter by salary range
                if (position.getSalaryMax() != null) {
                        candidates = candidates.stream()
                                        .filter(c -> c.getExpectedSalary() != null &&
                                                        c.getExpectedSalary().compareTo(position.getSalaryMax()) <= 0)
                                        .collect(Collectors.toList());
                }

                return candidates;
        }

        // Get candidates with skill match score for a position
        public List<Map<String, Object>> getCandidatesWithMatchScore(Long positionId) {
                JobPosition position = jobRepository.findById(positionId)
                                .orElseThrow(() -> new RuntimeException("Position not found"));

                // Get all active candidates
                List<Candidate> allCandidates = candidateRepository.findByIsActiveTrue();

                // Get required and preferred skills for the position
                List<JobSkillsRequired> allPositionSkills = jobSkillsRequiredRepository.findByPosition(position);
                List<JobSkillsRequired> mandatorySkills = allPositionSkills.stream()
                                .filter(JobSkillsRequired::isMandatory)
                                .collect(Collectors.toList());

                // Calculate match score for each candidate
                List<Map<String, Object>> matchedCandidates = new ArrayList<>();

                for (Candidate candidate : allCandidates) {
                        // Get candidate's skills
                        List<CandidateSkills> candidateSkills = candidateSkillsRepository.findByCandidate(candidate);
                        List<Long> candidateSkillIds = candidateSkills.stream()
                                        .map(cs -> cs.getSkill().getSkillId())
                                        .collect(Collectors.toList());

                        // Check mandatory skills match
                        long mandatoryMatched = mandatorySkills.stream()
                                        .filter(ms -> candidateSkillIds.contains(ms.getSkill().getSkillId()))
                                        .count();

                        // Skip if mandatory skills not met
                        if (mandatorySkills.size() > 0 && mandatoryMatched < mandatorySkills.size()) {
                                continue;
                        }

                        // Check experience match
                        boolean experienceMatch = true;
                        if (position.getExperienceRequiredMin() != null) {
                                if (candidate.getTotalExperience() == null ||
                                                candidate.getTotalExperience().compareTo(BigDecimal
                                                                .valueOf(position.getExperienceRequiredMin())) < 0) {
                                        experienceMatch = false;
                                }
                        }
                        if (position.getExperienceRequiredMax() != null) {
                                if (candidate.getTotalExperience() == null ||
                                                candidate.getTotalExperience().compareTo(BigDecimal
                                                                .valueOf(position.getExperienceRequiredMax())) > 0) {
                                        experienceMatch = false;
                                }
                        }

                        // Check salary match
                        boolean salaryMatch = true;
                        if (position.getSalaryMax() != null) {
                                if (candidate.getExpectedSalary() != null &&
                                                candidate.getExpectedSalary().compareTo(position.getSalaryMax()) > 0) {
                                        salaryMatch = false;
                                }
                        }

                        // Calculate match percentage
                        double matchPercentage = 0;
                        if (allPositionSkills.size() > 0) {
                                long totalMatched = mandatoryMatched;
                                for (JobSkillsRequired skill : allPositionSkills) {
                                        if (!skill.isMandatory()
                                                        && candidateSkillIds.contains(skill.getSkill().getSkillId())) {
                                                totalMatched++;
                                        }
                                }
                                matchPercentage = (totalMatched * 100.0) / allPositionSkills.size();
                        } else {
                                matchPercentage = 100;
                        }

                        // Create match result
                        Map<String, Object> matchResult = new HashMap<>();
                        matchResult.put("candidate", candidate);
                        matchResult.put("matchPercentage", Math.round(matchPercentage));
                        matchResult.put("mandatorySkillsMatched", mandatoryMatched);
                        matchResult.put("mandatorySkillsRequired", mandatorySkills.size());
                        matchResult.put("experienceMatch", experienceMatch);
                        matchResult.put("salaryMatch", salaryMatch);
                        matchResult.put("matchQuality", getMatchQuality(matchPercentage, experienceMatch, salaryMatch));

                        matchedCandidates.add(matchResult);
                }

                // Sort by match percentage (descending)
                matchedCandidates.sort((a, b) -> {
                        long matchA = (long) a.get("matchPercentage");
                        long matchB = (long) b.get("matchPercentage");
                        return Long.compare(matchB, matchA);
                });

                return matchedCandidates;
        }

        private String getMatchQuality(double matchPercentage, boolean experienceMatch, boolean salaryMatch) {
                if (matchPercentage >= 80 && experienceMatch && salaryMatch) {
                        return "Excellent";
                } else if (matchPercentage >= 60 && experienceMatch) {
                        return "Good";
                } else if (matchPercentage >= 40) {
                        return "Fair";
                } else {
                        return "Poor";
                }
        }

        // Update candidate profile
        public Candidate updateCandidate(Long candidateId, Candidate updatedCandidate) {
                Candidate candidate = candidateRepository.findById(candidateId)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                candidate.setFirstName(updatedCandidate.getFirstName());
                candidate.setLastName(updatedCandidate.getLastName());
                candidate.setPhone(updatedCandidate.getPhone());
                candidate.setAlternatePhone(updatedCandidate.getAlternatePhone());
                candidate.setCurrentLocation(updatedCandidate.getCurrentLocation());
                candidate.setPreferredLocation(updatedCandidate.getPreferredLocation());
                candidate.setTotalExperience(updatedCandidate.getTotalExperience());
                candidate.setCurrentSalary(updatedCandidate.getCurrentSalary());
                candidate.setExpectedSalary(updatedCandidate.getExpectedSalary());
                candidate.setNoticePeriod(updatedCandidate.getNoticePeriod());
                candidate.setSource(updatedCandidate.getSource());
                candidate.setSourceDetails(updatedCandidate.getSourceDetails());
                candidate.setLinkedinUrl(updatedCandidate.getLinkedinUrl());
                candidate.setGithubUrl(updatedCandidate.getGithubUrl());
                candidate.setPortfolioUrl(updatedCandidate.getPortfolioUrl());
                candidate.setUpdatedAt(LocalDateTime.now());

                return candidateRepository.save(candidate);
        }

        // Deactivate candidate
        public void deactivateCandidate(Long candidateId) {
                Candidate candidate = candidateRepository.findById(candidateId)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                candidate.setIsActive(false);
                candidate.setUpdatedAt(LocalDateTime.now());
                candidateRepository.save(candidate);
        }

        // Get candidate's CVs
        public List<CandidateCV> getCandidateCVs(Long candidateId) {
                return candidateCVRepository.findByCandidateId(candidateId);
        }

        // Get candidate's skills
        public List<CandidateSkills> getCandidateSkills(Long candidateId) {
                return candidateSkillsRepository.findByCandidate_CandidateId(candidateId);
        }

        // Create / link candidate to a position (create JobApplication)
        public JobApplication createApplication(Long candidateId, Long positionId, Long cvId) {
                Candidate candidate = candidateRepository.findById(candidateId)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                JobPosition position = jobRepository.findById(positionId)
                                .orElseThrow(() -> new RuntimeException("Position not found"));

                CandidateCV cv = null;
                if (cvId != null) {
                        cv = candidateCVRepository.findById(cvId).orElse(null);
                }

                JobApplication application = JobApplication.builder()
                                .candidate(candidate)
                                .position(position)
                                .cv(cv)
                                .status(JobApplication.Status.APPLIED)
                                .build();

                return jobApplicationRepository.save(application);
        }
}
