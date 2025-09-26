package com.recruitment.server.controller;

import com.recruitment.server.model.JobPosition;
import com.recruitment.server.repository.JobRepository;
import com.recruitment.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/positions")
public class JobPositionController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobPositionController(JobRepository jobRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
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
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deletePosition(@PathVariable("position_id") Long id) {
        return jobRepository.findById(id)
                .map(job -> {
                    jobRepository.delete(job);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{position_id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
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
}
