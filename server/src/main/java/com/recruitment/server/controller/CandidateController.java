package com.recruitment.server.controller;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.CandidateRepository;
import com.recruitment.server.repository.CandidateCVRepository;
import com.recruitment.server.repository.JobApplicationRepository;
import com.recruitment.server.repository.JobRepository;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.ArraySchema;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // Create candidate profile manually
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Candidate.class), examples = @ExampleObject(name = "CreateCandidate", value = "{\"email\":\"new.candidate@hireflow.com\",\"firstName\":\"Neha\",\"lastName\":\"Verma\",\"phone\":\"+919812345678\",\"currentLocation\":\"Mumbai\",\"preferredLocation\":\"Mumbai\",\"totalExperience\":3,\"source\":\"JOB_PORTAL\"}")))
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Map.class)), examples = @ExampleObject(name = "BulkUploadCandidates", value = "[{\"email\":\"alice@example.com\",\"firstName\":\"Alice\",\"lastName\":\"Anderson\",\"phone\":\"+919876543210\",\"currentLocation\":\"Mumbai\",\"totalExperience\":3},{\"email\":\"bob@example.com\",\"firstName\":\"Bob\",\"lastName\":\"Builder\",\"phone\":\"+919812345678\",\"currentLocation\":\"New Delhi\",\"totalExperience\":5}]")))
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "AddCandidateSkill", value = "{\"skillId\":1,\"proficiencyLevelId\":2,\"yearsOfExperience\":3}")))
    public ResponseEntity<?> addCandidateSkill(@PathVariable Long candidateId,
            @RequestBody Map<String, Object> skillData) {
        try {
            // Extract skillId - handle both String and Number
            Long skillId = null;
            Object skillIdObj = skillData.get("skillId");
            if (skillIdObj != null) {
                if (skillIdObj instanceof Number) {
                    skillId = ((Number) skillIdObj).longValue();
                } else if (skillIdObj instanceof String) {
                    skillId = Long.parseLong((String) skillIdObj);
                }
            }

            // Extract proficiencyLevelId - handle both String and Number
            Long proficiencyLevelId = null;
            Object profLevelObj = skillData.get("proficiencyLevelId");
            if (profLevelObj != null) {
                if (profLevelObj instanceof Number) {
                    proficiencyLevelId = ((Number) profLevelObj).longValue();
                } else if (profLevelObj instanceof String) {
                    proficiencyLevelId = Long.parseLong((String) profLevelObj);
                }
            }

            // Extract yearsOfExperience if provided
            BigDecimal yearsOfExperience = null;
            if (skillData.containsKey("yearsOfExperience") && skillData.get("yearsOfExperience") != null) {
                Object yearsObj = skillData.get("yearsOfExperience");
                if (yearsObj instanceof Number) {
                    yearsOfExperience = new BigDecimal(((Number) yearsObj).doubleValue());
                } else if (yearsObj instanceof String) {
                    yearsOfExperience = new BigDecimal((String) yearsObj);
                }
            }

            CandidateSkills candidateSkill = candidateService.addCandidateSkill(candidateId, skillId,
                    proficiencyLevelId, yearsOfExperience);
            return ResponseEntity.status(HttpStatus.CREATED).body(candidateSkill);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add skill: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get all candidates
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','REVIEWER','VIEWER')")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    // Get candidate by ID
    @GetMapping("/{candidateId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','REVIEWER','VIEWER')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','REVIEWER','VIEWER')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','REVIEWER','VIEWER')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Candidate.class), examples = @ExampleObject(name = "UpdateCandidate", value = "{\"firstName\":\"Alice\",\"lastName\":\"Anderson\",\"phone\":\"+919876543210\",\"currentLocation\":\"Mumbai\",\"totalExperience\":4,\"expectedSalary\":90000}")))
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','VIEWER')")
    public ResponseEntity<List<CandidateCV>> getCandidateCVs(@PathVariable Long candidateId) {
        List<CandidateCV> cvs = candidateService.getCandidateCVs(candidateId);
        return ResponseEntity.ok(cvs);
    }

    // Get my (current candidate's) skills
    @GetMapping("/me/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getMySkills(Authentication authentication) {
        try {
            String email = authentication.getName();
            Candidate candidate = candidateRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Candidate profile not found"));
            List<CandidateSkills> skills = candidateService.getCandidateSkills(candidate.getCandidateId());
            return ResponseEntity.ok(skills);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get skills: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get candidate's skills
    @GetMapping("/{candidateId}/skills")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','VIEWER')")
    public ResponseEntity<List<CandidateSkills>> getCandidateSkills(@PathVariable Long candidateId) {
        List<CandidateSkills> skills = candidateService.getCandidateSkills(candidateId);
        return ResponseEntity.ok(skills);
    }

    // Delete candidate's skill
    @DeleteMapping("/skills/{candidateSkillId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    public ResponseEntity<?> deleteCandidateSkill(@PathVariable Long candidateSkillId) {
        try {
            candidateService.deleteCandidateSkillById(candidateSkillId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Skill deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete skill: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Link a candidate to a position (create application)
    @PostMapping("/{candidateId}/apply")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "ApplyCandidate", value = "{\"positionId\":1,\"cvId\":1}")))
    public ResponseEntity<?> applyCandidateToPosition(@PathVariable Long candidateId,
            @RequestBody Map<String, Object> body) {
        try {
            // Safely parse positionId
            Long positionId = null;
            Object positionIdObj = body.get("positionId");
            if (positionIdObj != null) {
                if (positionIdObj instanceof Number) {
                    positionId = ((Number) positionIdObj).longValue();
                } else {
                    try {
                        positionId = Long.parseLong(positionIdObj.toString());
                    } catch (NumberFormatException e) {
                        positionId = null;
                    }
                }
            }

            // Safely parse cvId
            Long cvId = null;
            Object cvIdObj = body.get("cvId");
            if (cvIdObj != null) {
                if (cvIdObj instanceof Number) {
                    cvId = ((Number) cvIdObj).longValue();
                } else {
                    try {
                        cvId = Long.parseLong(cvIdObj.toString());
                    } catch (NumberFormatException e) {
                        cvId = null;
                    }
                }
            }

            if (positionId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "positionId is required and must be a valid number");
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

    // Get candidates matching a position with match score
    @GetMapping("/matching/{positionId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','REVIEWER','VIEWER')")
    public ResponseEntity<?> getMatchingCandidates(@PathVariable Long positionId) {
        try {
            List<Map<String, Object>> matchingCandidates = candidateService.getCandidatesWithMatchScore(positionId);
            return ResponseEntity.ok(matchingCandidates);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get matching candidates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Candidate self-service endpoints
    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Candidate candidate = resolveCandidateProfile(user, email);

            Map<String, Object> response = new HashMap<>();
            response.put("candidate", candidate);
            response.put("user", Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "requiresPasswordChange",
                    user.getRequiresPasswordChange() != null && user.getRequiresPasswordChange()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            List<JobApplication> applications = jobApplicationRepository.findByCandidate(candidate);

            // Map applications to include position details
            List<Map<String, Object>> applicationData = applications.stream()
                    .map(app -> {
                        Map<String, Object> appMap = new HashMap<>();
                        appMap.put("applicationId", app.getApplicationId());
                        appMap.put("status", app.getStatus());
                        appMap.put("currentStage", app.getCurrentStage());
                        appMap.put("appliedAt", app.getAppliedAt());
                        appMap.put("statusUpdatedAt", app.getStatusUpdatedAt());
                        appMap.put("overallScore", app.getOverallScore());
                        appMap.put("holdReason", app.getHoldReason());
                        appMap.put("rejectionReason", app.getRejectionReason());
                        appMap.put("notes", app.getNotes());

                        // Include position summary
                        JobPosition position = app.getPosition();
                        if (position != null) {
                            Map<String, Object> positionMap = new HashMap<>();
                            positionMap.put("positionId", position.getPositionId());
                            positionMap.put("jobTitle", position.getJobTitle());
                            positionMap.put("department", position.getDepartment());
                            positionMap.put("status", position.getStatus());
                            appMap.put("position", positionMap);
                        }

                        return appMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(applicationData);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get applications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me/applications/{applicationId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getMyApplicationById(@PathVariable Long applicationId, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Verify that the application belongs to this candidate
            if (!application.getCandidate().getCandidateId().equals(candidate.getCandidateId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You are not authorized to view this application");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Map application with full details
            Map<String, Object> appMap = new HashMap<>();
            appMap.put("applicationId", application.getApplicationId());
            appMap.put("id", application.getApplicationId());
            appMap.put("status", application.getStatus());
            appMap.put("currentStage", application.getCurrentStage());
            appMap.put("appliedAt", application.getAppliedAt());
            appMap.put("statusUpdatedAt", application.getStatusUpdatedAt());
            appMap.put("overallScore", application.getOverallScore());
            appMap.put("holdReason", application.getHoldReason());
            appMap.put("rejectionReason", application.getRejectionReason());
            appMap.put("notes", application.getNotes());

            // Include full candidate details
            Candidate appCandidate = application.getCandidate();
            if (appCandidate != null) {
                Map<String, Object> candidateMap = new HashMap<>();
                candidateMap.put("candidateId", appCandidate.getCandidateId());
                candidateMap.put("id", appCandidate.getCandidateId());
                candidateMap.put("firstName", appCandidate.getFirstName());
                candidateMap.put("lastName", appCandidate.getLastName());
                candidateMap.put("email", appCandidate.getEmail());
                candidateMap.put("phone", appCandidate.getPhone());
                candidateMap.put("currentLocation", appCandidate.getCurrentLocation());
                candidateMap.put("totalExperience", appCandidate.getTotalExperience());
                appMap.put("candidate", candidateMap);
                appMap.put("candidateId", appCandidate.getCandidateId());
                appMap.put("candidateName", appCandidate.getFirstName() + " " + appCandidate.getLastName());
            }

            // Include full position details
            JobPosition position = application.getPosition();
            if (position != null) {
                Map<String, Object> positionMap = new HashMap<>();
                positionMap.put("positionId", position.getPositionId());
                positionMap.put("id", position.getPositionId());
                positionMap.put("jobTitle", position.getJobTitle());
                positionMap.put("jobDescription", position.getJobDescription());
                positionMap.put("department", position.getDepartment());
                positionMap.put("employmentType", position.getEmploymentType());
                positionMap.put("experienceRequiredMin", position.getExperienceRequiredMin());
                positionMap.put("experienceRequiredMax", position.getExperienceRequiredMax());
                positionMap.put("salaryMin", position.getSalaryMin());
                positionMap.put("salaryMax", position.getSalaryMax());
                positionMap.put("status", position.getStatus());
                appMap.put("position", positionMap);
                appMap.put("positionId", position.getPositionId());
                appMap.put("positionTitle", position.getJobTitle());
            }

            // Include CV details if available
            if (application.getCv() != null) {
                CandidateCV cv = application.getCv();
                Map<String, Object> cvMap = new HashMap<>();
                cvMap.put("cvId", cv.getCvId());
                cvMap.put("fileName", cv.getFileName());
                cvMap.put("uploadedAt", cv.getUploadedAt());
                appMap.put("cv", cvMap);
            }

            return ResponseEntity.ok(appMap);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get application: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me/available-positions")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getAvailablePositions(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            // Get all open positions
            List<JobPosition> openPositions = jobRepository.findAll().stream()
                    .filter(pos -> pos.getStatus() != null &&
                            (pos.getStatus().name().equals("OPEN") ||
                                    pos.getStatus().name().equals("HOLD")))
                    .collect(Collectors.toList());

            // Get positions where candidate has already applied
            List<JobApplication> existingApplications = jobApplicationRepository.findByCandidate(candidate);
            List<Long> appliedPositionIds = existingApplications.stream()
                    .map(app -> app.getPosition().getPositionId())
                    .collect(Collectors.toList());

            // Filter out positions where candidate has already applied
            List<Map<String, Object>> availablePositions = openPositions.stream()
                    .filter(pos -> !appliedPositionIds.contains(pos.getPositionId()))
                    .map(pos -> {
                        Map<String, Object> posMap = new HashMap<>();
                        posMap.put("positionId", pos.getPositionId());
                        posMap.put("jobTitle", pos.getJobTitle());
                        posMap.put("department", pos.getDepartment());
                        posMap.put("jobDescription", pos.getJobDescription());
                        posMap.put("status", pos.getStatus());
                        posMap.put("createdAt", pos.getCreatedAt());
                        return posMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("positions", availablePositions);
            response.put("count", availablePositions.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get available positions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me/cvs")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> getMyCVs(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            List<CandidateCV> cvs = candidateService.getCandidateCVs(candidate.getCandidateId());
            return ResponseEntity.ok(cvs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get CVs: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/me/cv")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> uploadMyCV(Authentication authentication,
            @RequestParam(required = false) Long positionId,
            @RequestParam("file") MultipartFile file) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            Map<String, Object> result = candidateService.uploadCV(candidate.getCandidateId(), positionId, file);
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

    @DeleteMapping("/me/cvs/{cvId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> deleteMyCV(Authentication authentication, @PathVariable Long cvId) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            // Verify the CV belongs to this candidate
            CandidateCV cv = candidateCVRepository.findById(cvId)
                    .orElseThrow(() -> new RuntimeException("CV not found"));

            if (!cv.getCandidate().getCandidateId().equals(candidate.getCandidateId())) {
                throw new RuntimeException("You can only delete your own CVs");
            }

            candidateCVRepository.deleteById(cvId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "CV deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me/cvs/{cvId}/download")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> downloadMyCV(Authentication authentication, @PathVariable Long cvId) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Candidate candidate = resolveCandidateProfile(user, email);

            // Verify the CV belongs to this candidate
            CandidateCV cv = candidateCVRepository.findById(cvId)
                    .orElseThrow(() -> new RuntimeException("CV not found"));

            if (!cv.getCandidate().getCandidateId().equals(candidate.getCandidateId())) {
                throw new RuntimeException("You can only download your own CVs");
            }

            // Return the cloudUrl or cvFilePath for download
            String downloadUrl = cv.getCloudUrl() != null ? cv.getCloudUrl() : cv.getCvFilePath();
            if (downloadUrl == null || downloadUrl.isEmpty()) {
                throw new RuntimeException("CV download URL not found");
            }

            Map<String, String> response = new HashMap<>();
            response.put("downloadUrl", downloadUrl);
            response.put("fileName", cv.getFileName() != null ? cv.getFileName() : "CV_" + cvId + ".pdf");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to download CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    private Candidate resolveCandidateProfile(User user, String email) {
        return candidateRepository.findByUser_UserId(user.getUserId())
                .or(() -> candidateRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));
    }
}
