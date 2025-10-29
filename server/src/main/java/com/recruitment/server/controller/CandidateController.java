package com.recruitment.server.controller;

import com.recruitment.server.model.*;
import com.recruitment.server.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private final CandidateService candidateService;

    // Create candidate profile manually
    @PostMapping
    public ResponseEntity<?> createCandidate(@RequestBody Candidate candidate) {
        try {
            Candidate createdCandidate = candidateService.createCandidate(candidate);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCandidate);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create candidate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Upload CV for candidate
    @PostMapping("/{candidateId}/cv")
    public ResponseEntity<?> uploadCV(@PathVariable Long candidateId,
            @RequestParam(required = false) Long positionId,
            @RequestParam("file") MultipartFile file) {
        try {
            // service now returns a map containing keys: "cv", "candidate", and optionally
            // "application"
            Map<String, Object> result = candidateService.uploadCV(candidateId, positionId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Bulk upload candidates from Excel
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadCandidates(@RequestBody List<Map<String, Object>> candidateData) {
        try {
            List<Candidate> candidates = candidateService.bulkUploadCandidates(candidateData);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully uploaded " + candidates.size() + " candidates");
            response.put("candidates", candidates);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to bulk upload candidates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Create candidate using uploaded CV (no existing candidateId required)
    @PostMapping("/from-cv")
    public ResponseEntity<?> createCandidateFromCV(@RequestParam(required = false) Long positionId,
            @RequestParam("file") MultipartFile file) {
        try {
            // positionId is optional now. Service will handle null.
            Map<String, Object> result = candidateService.createCandidateFromCV(file, positionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create candidate from CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Add skills to candidate
    @PostMapping("/{candidateId}/skills")
    public ResponseEntity<?> addCandidateSkill(@PathVariable Long candidateId,
            @RequestBody Map<String, Long> skillData) {
        try {
            Long skillId = skillData.get("skillId");
            Long proficiencyLevelId = skillData.get("proficiencyLevelId");

            CandidateSkills candidateSkill = candidateService.addCandidateSkill(candidateId, skillId,
                    proficiencyLevelId);
            return ResponseEntity.status(HttpStatus.CREATED).body(candidateSkill);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add skill: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get all candidates
    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    // Get candidate by ID
    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getCandidateById(@PathVariable Long candidateId) {
        Optional<Candidate> candidate = candidateService.getCandidateById(candidateId);
        if (candidate.isPresent()) {
            return ResponseEntity.ok(candidate.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Candidate not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Search candidates by criteria
    @GetMapping("/search")
    public ResponseEntity<List<Candidate>> searchCandidates(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minExp,
            @RequestParam(required = false) BigDecimal maxExp,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) List<String> skills) {

        List<Candidate> candidates = candidateService.searchCandidates(name, location, minExp, maxExp, maxSalary,
                skills);
        return ResponseEntity.ok(candidates);
    }

    // Find candidates matching job requirements
    @GetMapping("/for-position/{positionId}")
    public ResponseEntity<?> findCandidatesForPosition(@PathVariable Long positionId) {
        try {
            List<Candidate> candidates = candidateService.findCandidatesForPosition(positionId);
            return ResponseEntity.ok(candidates);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to find candidates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Update candidate profile
    @PutMapping("/{candidateId}")
    public ResponseEntity<?> updateCandidate(@PathVariable Long candidateId, @RequestBody Candidate updatedCandidate) {
        try {
            Candidate candidate = candidateService.updateCandidate(candidateId, updatedCandidate);
            return ResponseEntity.ok(candidate);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update candidate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Deactivate candidate
    @DeleteMapping("/{candidateId}")
    public ResponseEntity<?> deactivateCandidate(@PathVariable Long candidateId) {
        try {
            candidateService.deactivateCandidate(candidateId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Candidate deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to deactivate candidate: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get candidate's CVs
    @GetMapping("/{candidateId}/cvs")
    public ResponseEntity<List<CandidateCV>> getCandidateCVs(@PathVariable Long candidateId) {
        List<CandidateCV> cvs = candidateService.getCandidateCVs(candidateId);
        return ResponseEntity.ok(cvs);
    }

    // Get candidate's skills
    @GetMapping("/{candidateId}/skills")
    public ResponseEntity<List<CandidateSkills>> getCandidateSkills(@PathVariable Long candidateId) {
        List<CandidateSkills> skills = candidateService.getCandidateSkills(candidateId);
        return ResponseEntity.ok(skills);
    }

    // Link a candidate to a position (create application)
    @PostMapping("/{candidateId}/apply")
    public ResponseEntity<?> applyCandidateToPosition(@PathVariable Long candidateId,
            @RequestBody Map<String, Object> body) {
        try {
            Long positionId = body.get("positionId") instanceof Number ? ((Number) body.get("positionId")).longValue()
                    : body.get("positionId") != null ? Long.parseLong(body.get("positionId").toString()) : null;

            Long cvId = body.get("cvId") instanceof Number ? ((Number) body.get("cvId")).longValue()
                    : body.get("cvId") != null ? Long.parseLong(body.get("cvId").toString()) : null;

            if (positionId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "positionId is required");
                return ResponseEntity.badRequest().body(error);
            }

            JobApplication application = candidateService.createApplication(candidateId, positionId, cvId);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create application: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
