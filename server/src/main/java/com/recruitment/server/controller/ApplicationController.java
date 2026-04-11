package com.recruitment.server.controller;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "CreateApplication", value = "{\"candidateId\":1,\"positionId\":1,\"cvId\":1}")))
    public ResponseEntity<?> createApplication(@RequestBody Map<String, Object> applicationData) {
        try {
            Long candidateId = Long.valueOf(applicationData.get("candidateId").toString());
            Long positionId = Long.valueOf(applicationData.get("positionId").toString());
            Long cvId = applicationData.get("cvId") != null
                    ? Long.valueOf(applicationData.get("cvId").toString())
                    : null;

            JobApplication application = applicationService.createApplication(candidateId, positionId, cvId);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<?> getAllApplications(@RequestParam(required = false) Long positionId,
            @RequestParam(required = false) Long candidateId,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            // Get current user
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String roleName = currentUser.getRole().getRoleName();
            List<JobApplication> applications;

            // Apply role-based filtering for REVIEWER, INTERVIEWER, and RECRUITER
            // HR, ADMIN, SUPER_ADMIN, and VIEWER can see all applications
            boolean needsRoleFiltering = roleName.equals("REVIEWER") ||
                    roleName.equals("INTERVIEWER") ||
                    roleName.equals("RECRUITER");

            if (positionId != null) {
                applications = applicationService.getApplicationsByPosition(positionId);
                // Apply role-based filtering even when positionId is specified
                if (needsRoleFiltering) {
                    applications = applications.stream()
                            .filter(app -> applicationService.hasAccessToApplication(currentUser, app))
                            .toList();
                }
            } else if (candidateId != null) {
                applications = applicationService.getApplicationsByCandidate(candidateId);
                // Apply role-based filtering even when candidateId is specified
                if (needsRoleFiltering) {
                    applications = applications.stream()
                            .filter(app -> applicationService.hasAccessToApplication(currentUser, app))
                            .toList();
                }
            } else if (status != null) {
                applications = applicationService.getApplicationsByStatus(
                        JobApplication.Status.valueOf(status));
                // Apply role-based filtering even when status is specified
                if (needsRoleFiltering) {
                    applications = applications.stream()
                            .filter(app -> applicationService.hasAccessToApplication(currentUser, app))
                            .toList();
                }
            } else {
                // Use role-based filtering for the main query
                if (needsRoleFiltering) {
                    applications = applicationService.getApplicationsByRole(currentUser);
                } else {
                    applications = applicationService.getAllApplications();
                }
            }

            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','REVIEWER','INTERVIEWER','VIEWER','CANDIDATE')")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId,
            Authentication authentication) {
        try {
            // Get current user
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.getApplicationById(applicationId);

            // Check if user has access to this application
            if (!applicationService.hasAccessToApplication(currentUser, application)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have access to this application"));
            }

            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "UpdateApplicationStatus", value = "{\"status\":\"SCREENING\",\"reason\":\"Initial review\"}")))
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId,
            @RequestBody Map<String, String> statusData,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String status = statusData.get("status");
            String reason = statusData.get("reason");

            JobApplication application = applicationService.updateApplicationStatus(
                    applicationId,
                    JobApplication.Status.valueOf(status),
                    reason,
                    updatedBy);

            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/hold")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<?> moveToHold(@PathVariable Long applicationId,
            @RequestParam String reason,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.moveToHold(applicationId, reason, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId,
            @RequestParam String reason,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.rejectApplication(applicationId, reason, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/move-to-screening")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<?> moveToScreening(@PathVariable Long applicationId,
            Authentication authentication) {
        User updatedBy = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.recruitment.server.exception.ResourceNotFoundException("User not found"));

        JobApplication application = applicationService.moveToScreening(applicationId, updatedBy);
        return ResponseEntity.ok(application);
    }

    @PutMapping("/{applicationId}/attach-cv/{cvId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    public ResponseEntity<?> attachCvToApplication(@PathVariable Long applicationId,
            @PathVariable Long cvId,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(
                            () -> new com.recruitment.server.exception.ResourceNotFoundException("User not found"));
            JobApplication application = applicationService.attachCvToApplication(applicationId, cvId, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/move-to-interview")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','REVIEWER')")
    public ResponseEntity<?> moveToInterview(@PathVariable Long applicationId,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.moveToInterview(applicationId, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/select")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<?> selectCandidate(@PathVariable Long applicationId,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.selectCandidate(applicationId, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> deleteApplication(@PathVariable Long applicationId) {
        try {
            applicationService.deleteApplication(applicationId);
            return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
