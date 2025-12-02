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

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllApplications(@RequestParam(required = false) Long positionId,
            @RequestParam(required = false) Long candidateId,
            @RequestParam(required = false) String status) {
        try {
            List<JobApplication> applications;

            if (positionId != null) {
                applications = applicationService.getApplicationsByPosition(positionId);
            } else if (candidateId != null) {
                applications = applicationService.getApplicationsByCandidate(candidateId);
            } else if (status != null) {
                applications = applicationService.getApplicationsByStatus(
                    JobApplication.Status.valueOf(status));
            } else {
                applications = applicationService.getAllApplications();
            }

            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId) {
        try {
            JobApplication application = applicationService.getApplicationById(applicationId);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<?> moveToScreening(@PathVariable Long applicationId,
            Authentication authentication) {
        try {
            User updatedBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobApplication application = applicationService.moveToScreening(applicationId, updatedBy);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/move-to-interview")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'REVIEWER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteApplication(@PathVariable Long applicationId) {
        try {
            applicationService.deleteApplication(applicationId);
            return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
