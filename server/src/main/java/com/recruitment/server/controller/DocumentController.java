package com.recruitment.server.controller;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    public ResponseEntity<?> uploadDocument(@RequestParam Long applicationId,
            @RequestParam Long documentTypeId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            User uploadedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CandidateDocuments document = documentService.uploadDocument(
                    applicationId, documentTypeId, file, uploadedBy);

            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{documentId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "VerifyDocument", value = "{\"status\":\"VERIFIED\",\"remarks\":\"Clear document\"}")))
    public ResponseEntity<?> verifyDocument(@PathVariable Long documentId,
            @RequestBody Map<String, String> verificationData,
            Authentication authentication) {
        try {
            User verifiedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CandidateDocuments.Status status = CandidateDocuments.Status
                    .valueOf(verificationData.get("status"));
            String remarks = verificationData.get("remarks");

            CandidateDocuments document = documentService.verifyDocument(
                    documentId, verifiedBy, status, remarks);

            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','CANDIDATE','VIEWER')")
    public ResponseEntity<?> getDocumentsByApplication(@PathVariable Long applicationId) {
        try {
            List<CandidateDocuments> documents = documentService.getDocumentsByApplication(applicationId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> getPendingDocuments() {
        try {
            List<CandidateDocuments> documents = documentService.getPendingDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/types")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','CANDIDATE','VIEWER')")
    public ResponseEntity<?> getAllDocumentTypes() {
        try {
            List<DocumentTypes> types = documentService.getAllDocumentTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/types")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentTypes.class), examples = @ExampleObject(name = "CreateDocumentType", value = "{\"name\":\"PAN Card\"}")))
    public ResponseEntity<?> createDocumentType(@RequestBody DocumentTypes documentType) {
        try {
            DocumentTypes created = documentService.createDocumentType(documentType);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            documentService.deleteDocument(documentId);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
