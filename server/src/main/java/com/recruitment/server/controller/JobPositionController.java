package com.recruitment.server.controller;

import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.JobSkillsRequired;
import com.recruitment.server.model.Skills;
import com.recruitment.server.model.ProficiencyLevels;
import com.recruitment.server.model.JobApplication;
import com.recruitment.server.repository.JobRepository;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.repository.JobSkillsRequiredRepository;
import com.recruitment.server.repository.SkillsRepository;
import com.recruitment.server.repository.ProficiencyLevelsRepository;
import com.recruitment.server.repository.JobApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;

import com.recruitment.server.service.JobPositionService;
import com.recruitment.server.dto.CommentRequest;
import com.recruitment.server.model.Notification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/positions")
public class JobPositionController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobSkillsRequiredRepository jobSkillsRequiredRepository;
    private final SkillsRepository skillsRepository;
    private final ProficiencyLevelsRepository proficiencyLevelsRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobPositionService jobPositionService;

    public JobPositionController(JobRepository jobRepository, UserRepository userRepository,
            JobSkillsRequiredRepository jobSkillsRequiredRepository,
            SkillsRepository skillsRepository,
            ProficiencyLevelsRepository proficiencyLevelsRepository,
            JobApplicationRepository jobApplicationRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobSkillsRequiredRepository = jobSkillsRequiredRepository;
        this.skillsRepository = skillsRepository;
        this.proficiencyLevelsRepository = proficiencyLevelsRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @GetMapping
    public ResponseEntity<List<JobPosition>> getAllPositions() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @GetMapping("/{position_id}")
    public ResponseEntity<?> getPositionById(@PathVariable("position_id") Long id) {
        Optional<JobPosition> job = jobRepository.findById(id);
        return job.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<JobPosition> createPosition(@RequestBody JobPosition jobPosition,
            Authentication authentication) {
        // Set the creating user based on authenticated principal
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            userRepository.findByEmail(email).ifPresent(jobPosition::setCreatedBy);
        }

        JobPosition saved = jobRepository.save(jobPosition);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{position_id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> updatePosition(@PathVariable("position_id") Long id, @RequestBody JobPosition jobDetails) {
        return jobRepository.findById(id)
                .map(job -> {
                    job.setJobTitle(jobDetails.getJobTitle());
                    job.setJobDescription(jobDetails.getJobDescription());
                    job.setDepartment(jobDetails.getDepartment());
                    job.setEmploymentType(jobDetails.getEmploymentType());
                    job.setExperienceRequiredMin(jobDetails.getExperienceRequiredMin());
                    job.setExperienceRequiredMax(jobDetails.getExperienceRequiredMax());
                    job.setSalaryMin(jobDetails.getSalaryMin());
                    job.setSalaryMax(jobDetails.getSalaryMax());
                    job.setTotalPositions(jobDetails.getTotalPositions());
                    job.setStatus(jobDetails.getStatus());
                    job.setClosureReason(jobDetails.getClosureReason());
                    job.setSelectedCandidate(jobDetails.getSelectedCandidate());
                    JobPosition updated = jobRepository.save(job);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{position_id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> deletePosition(@PathVariable("position_id") Long id) {
        return jobRepository.findById(id)
                .map(job -> {
                    jobRepository.delete(job);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{position_id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> updatePositionStatus(@PathVariable("position_id") Long id, @RequestParam String status) {
        return jobRepository.findById(id)
                .map(job -> {
                    try {
                        JobPosition.Status enumStatus = JobPosition.Status.valueOf(status);
                        job.setStatus(enumStatus);
                        JobPosition updated = jobRepository.save(job);
                        return ResponseEntity.ok(updated);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body("Invalid status value: " + status);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-positions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<JobPosition>> getMyPositions(Authentication authentication) {
        String username = authentication.getName();
        List<JobPosition> myPositions = jobRepository.findAll().stream()
                .filter(j -> j.getCreatedBy() != null && username.equals(j.getCreatedBy().getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(myPositions);
    }

    // Applications endpoint
    @GetMapping("/{position_id}/applications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<JobApplication>> getPositionApplications(@PathVariable("position_id") Long positionId) {
        Optional<JobPosition> position = jobRepository.findById(positionId);
        if (position.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<JobApplication> applications = jobApplicationRepository.findByPositionId(positionId);
        return ResponseEntity.ok(applications);
    }

    // Skills management endpoints
    @GetMapping("/{position_id}/skills")
    public ResponseEntity<Map<String, List<String>>> getPositionSkills(@PathVariable("position_id") Long positionId) {
        Optional<JobPosition> position = jobRepository.findById(positionId);
        if (position.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<JobSkillsRequired> requiredSkills = jobSkillsRequiredRepository.findAll().stream()
                .filter(jsr -> jsr.getPosition().getPositionId().equals(positionId) && jsr.isMandatory())
                .collect(Collectors.toList());

        List<JobSkillsRequired> preferredSkills = jobSkillsRequiredRepository.findAll().stream()
                .filter(jsr -> jsr.getPosition().getPositionId().equals(positionId) && !jsr.isMandatory())
                .collect(Collectors.toList());

        Map<String, List<String>> skillsMap = new HashMap<>();
        skillsMap.put("required", requiredSkills.stream()
                .map(jsr -> jsr.getSkill().getSkillName())
                .collect(Collectors.toList()));
        skillsMap.put("preferred", preferredSkills.stream()
                .map(jsr -> jsr.getSkill().getSkillName())
                .collect(Collectors.toList()));

        return ResponseEntity.ok(skillsMap);
    }

    @PostMapping("/{position_id}/skills")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> addPositionSkills(@PathVariable("position_id") Long positionId,
            @RequestBody Map<String, List<String>> skillsData) {
        Optional<JobPosition> position = jobRepository.findById(positionId);
        if (position.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Get or create default proficiency level
        ProficiencyLevels defaultLevel = proficiencyLevelsRepository.findByLevelName("Intermediate");
        if (defaultLevel == null) {
            defaultLevel = ProficiencyLevels.builder()
                    .levelName("Intermediate")
                    .description("Intermediate level proficiency")
                    .rank(3)
                    .build();
            defaultLevel = proficiencyLevelsRepository.save(defaultLevel);
        }

        // Clear existing skills for this position
        jobSkillsRequiredRepository.findAll().stream()
                .filter(jsr -> jsr.getPosition().getPositionId().equals(positionId))
                .forEach(jobSkillsRequiredRepository::delete);

        // Add required skills
        List<String> requiredSkills = skillsData.getOrDefault("required", List.of());
        for (String skillName : requiredSkills) {
            if (skillName != null && !skillName.trim().isEmpty()) {
                Skills skill = skillsRepository.findAll().stream()
                        .filter(s -> s.getSkillName().equalsIgnoreCase(skillName.trim()))
                        .findFirst()
                        .orElseGet(() -> {
                            Skills newSkill = Skills.builder()
                                    .skillName(skillName.trim())
                                    .category("General")
                                    .build();
                            return skillsRepository.save(newSkill);
                        });

                JobSkillsRequired jobSkill = JobSkillsRequired.builder()
                        .position(position.get())
                        .skill(skill)
                        .proficiencyLevel(defaultLevel)
                        .isMandatory(true)
                        .weightage(new BigDecimal("1.0"))
                        .build();
                jobSkillsRequiredRepository.save(jobSkill);
            }
        }

        // Add preferred skills
        List<String> preferredSkills = skillsData.getOrDefault("preferred", List.of());
        for (String skillName : preferredSkills) {
            if (skillName != null && !skillName.trim().isEmpty()) {
                Skills skill = skillsRepository.findAll().stream()
                        .filter(s -> s.getSkillName().equalsIgnoreCase(skillName.trim()))
                        .findFirst()
                        .orElseGet(() -> {
                            Skills newSkill = Skills.builder()
                                    .skillName(skillName.trim())
                                    .category("General")
                                    .build();
                            return skillsRepository.save(newSkill);
                        });

                JobSkillsRequired jobSkill = JobSkillsRequired.builder()
                        .position(position.get())
                        .skill(skill)
                        .proficiencyLevel(defaultLevel)
                        .isMandatory(false)
                        .weightage(new BigDecimal("0.5"))
                        .build();
                jobSkillsRequiredRepository.save(jobSkill);
            }
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{position_id}/skills")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> updatePositionSkills(@PathVariable("position_id") Long positionId,
            @RequestBody Map<String, List<String>> skillsData) {
        return addPositionSkills(positionId, skillsData);
    }

    // Position closing endpoint
    @PostMapping("/{position_id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> closePosition(@PathVariable("position_id") Long positionId,
            @RequestBody Map<String, Object> closeData) {
        Optional<JobPosition> position = jobRepository.findById(positionId);
        if (position.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        JobPosition job = position.get();
        job.setStatus(JobPosition.Status.CLOSED);
        job.setClosedAt(LocalDateTime.now());

        String reason = (String) closeData.get("reason");
        if (reason != null && !reason.trim().isEmpty()) {
            job.setClosureReason(reason.trim());
        }

        String selectedCandidateId = (String) closeData.get("selectedCandidate");
        if (selectedCandidateId != null && !selectedCandidateId.trim().isEmpty()) {
            // Note: In a real implementation, you'd fetch the candidate by ID
            // For now, we'll just store the ID as a string in closure reason if no reason
            // provided
            if (reason == null || reason.trim().isEmpty()) {
                job.setClosureReason("Position closed - Selected candidate: " + selectedCandidateId);
            }
        }

        JobPosition updated = jobRepository.save(job);
        return ResponseEntity.ok(updated);
    }

    // Update position status with reason
    @PatchMapping("/{position_id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')")
    public ResponseEntity<?> updatePositionStatusWithReason(@PathVariable("position_id") Long positionId,
            @RequestBody Map<String, String> statusData) {
        Optional<JobPosition> position = jobRepository.findById(positionId);
        if (position.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String status = statusData.get("status");
        String reason = statusData.get("reason");

        try {
            JobPosition.Status enumStatus = JobPosition.Status.valueOf(status);
            JobPosition job = position.get();
            job.setStatus(enumStatus);
            job.setUpdatedAt(LocalDateTime.now());

            if (reason != null && !reason.trim().isEmpty()) {
                job.setClosureReason(reason.trim());
            }

            if (enumStatus == JobPosition.Status.CLOSED) {
                job.setClosedAt(LocalDateTime.now());
            }

            JobPosition updated = jobRepository.save(job);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value: " + status);
        }
    }

    @PutMapping("/{position_id}/assign-reviewer")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER')")
    public ResponseEntity<?> assignReviewerToPosition(@PathVariable Long position_id, @RequestParam Long reviewerId) {
        try {
            jobPositionService.assignReviewer(position_id, reviewerId);
            return ResponseEntity.ok("Reviewer assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to assign reviewer: " + e.getMessage());
        }
    }

    @PostMapping("/{position_id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addCommentToPosition(@PathVariable Long position_id,
            @RequestBody CommentRequest commentRequest) {
        try {
            jobPositionService.addComment(position_id, commentRequest);
            return ResponseEntity.ok("Comment added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add comment: " + e.getMessage());
        }
    }

    @PutMapping("/{position_id}/shortlist")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<?> shortlistCandidate(@PathVariable Long position_id, @RequestParam Long candidateId) {
        try {
            jobPositionService.shortlistCandidate(position_id, candidateId);
            return ResponseEntity.ok("Candidate shortlisted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to shortlist candidate: " + e.getMessage());
        }
    }

    @GetMapping("/{position_id}/notifications")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','VIEWER')")
    public ResponseEntity<?> getNotificationsForPosition(@PathVariable Long position_id) {
        try {
            List<Notification> notifications = jobPositionService.getNotifications(position_id);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to fetch notifications: " + e.getMessage());
        }
    }
}
