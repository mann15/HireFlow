package com.recruitment.server.service;

import com.recruitment.server.dto.CommentRequest;
import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobPositionService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PositionReviewerRepository positionReviewerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public void assignReviewer(Long positionId, Long reviewerId) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        // Check if reviewer is already assigned
        if (positionReviewerRepository.existsByPositionAndReviewer(position, reviewer)) {
            throw new RuntimeException("Reviewer already assigned to this position");
        }

        PositionReviewer positionReviewer = PositionReviewer.builder()
                .position(position)
                .reviewer(reviewer)
                .assignedAt(LocalDateTime.now())
                .build();
        
        positionReviewerRepository.save(positionReviewer);

        // Send notification to reviewer
        notificationService.createNotification(
            reviewer,
            "You have been assigned as a reviewer for position: " + position.getJobTitle(),
            Notification.NotificationType.INFO,
            Notification.NotificationCategory.SCREENING_ASSIGNED,
            positionId
        );
    }

    public void addComment(Long positionId, CommentRequest commentRequest) {
        jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));
        
        // This would typically be associated with a specific application
        // For now, we'll skip implementation as it needs application context
        throw new UnsupportedOperationException("Use screening service to add comments to applications");
    }

    public void shortlistCandidate(Long positionId, Long candidateId) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));
        
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        // Find application
        List<JobApplication> applications = jobApplicationRepository
                .findByCandidateAndPosition(candidate, position);
        
        if (applications.isEmpty()) {
            throw new RuntimeException("No application found for this candidate and position");
        }

        JobApplication application = applications.get(0);
        application.setStatus(JobApplication.Status.INTERVIEW);
        application.setCurrentStage("SHORTLISTED");
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);
    }

    public List<Notification> getNotifications(Long positionId) {
        return notificationRepository.findByRelatedEntityIdOrderByCreatedAtDesc(positionId);
    }

    public JobPosition createPosition(JobPosition position, User createdBy) {
        position.setCreatedBy(createdBy);
        position.setCreatedAt(LocalDateTime.now());
        position.setUpdatedAt(LocalDateTime.now());
        return jobRepository.save(position);
    }

    public JobPosition updatePosition(Long positionId, JobPosition updatedPosition) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        position.setJobTitle(updatedPosition.getJobTitle());
        position.setJobDescription(updatedPosition.getJobDescription());
        position.setDepartment(updatedPosition.getDepartment());
        position.setEmploymentType(updatedPosition.getEmploymentType());
        position.setExperienceRequiredMin(updatedPosition.getExperienceRequiredMin());
        position.setExperienceRequiredMax(updatedPosition.getExperienceRequiredMax());
        position.setSalaryMin(updatedPosition.getSalaryMin());
        position.setSalaryMax(updatedPosition.getSalaryMax());
        position.setTotalPositions(updatedPosition.getTotalPositions());
        position.setUpdatedAt(LocalDateTime.now());

        return jobRepository.save(position);
    }

    public JobPosition updatePositionStatus(Long positionId, JobPosition.Status status, String reason) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        position.setStatus(status);
        position.setUpdatedAt(LocalDateTime.now());

        if (reason != null && !reason.trim().isEmpty()) {
            position.setClosureReason(reason);
        }

        if (status == JobPosition.Status.CLOSED) {
            position.setClosedAt(LocalDateTime.now());
        }

        return jobRepository.save(position);
    }

    public JobPosition closePosition(Long positionId, Long selectedCandidateId, String reason) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        position.setStatus(JobPosition.Status.CLOSED);
        position.setClosedAt(LocalDateTime.now());
        position.setUpdatedAt(LocalDateTime.now());

        if (selectedCandidateId != null) {
            Candidate candidate = candidateRepository.findById(selectedCandidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));
            position.setSelectedCandidate(candidate);
        }

        if (reason != null && !reason.trim().isEmpty()) {
            position.setClosureReason(reason);
        }

        return jobRepository.save(position);
    }

    public List<JobPosition> getAllPositions() {
        return jobRepository.findAll();
    }

    public List<JobPosition> getOpenPositions() {
        return jobRepository.findByStatus(JobPosition.Status.OPEN);
    }

    public JobPosition getPositionById(Long positionId) {
        return jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));
    }

    public List<JobPosition> getPositionsByCreator(User creator) {
        return jobRepository.findByCreatedBy(creator);
    }

    /**
     * Get positions filtered by user role
     * - REVIEWER: Only positions they're assigned to
     * - RECRUITER: Only positions they created
     * - HR, ADMIN, SUPER_ADMIN, VIEWER: All positions
     */
    public List<JobPosition> getPositionsByRole(User user) {
        String roleName = user.getRole().getRoleName();
        
        switch (roleName) {
            case "REVIEWER":
                // Get positions where reviewer is assigned
                List<PositionReviewer> reviewerAssignments = positionReviewerRepository
                        .findByReviewerUserId(user.getUserId());
                return reviewerAssignments.stream()
                        .map(PositionReviewer::getPosition)
                        .distinct()
                        .toList();
            case "RECRUITER":
                return jobRepository.findByCreatedBy(user);
            case "HR":
            case "ADMIN":
            case "SUPER_ADMIN":
            case "VIEWER":
                return jobRepository.findAll();
            default:
                return List.of();
        }
    }

    /**
     * Check if user has access to a specific position based on their role
     */
    public boolean hasAccessToPosition(User user, JobPosition position) {
        String roleName = user.getRole().getRoleName();
        
        switch (roleName) {
            case "REVIEWER":
                return positionReviewerRepository.existsByPositionAndReviewer(position, user);
            case "RECRUITER":
                return position.getCreatedBy() != null &&
                       position.getCreatedBy().getUserId().equals(user.getUserId());
            case "HR":
            case "ADMIN":
            case "SUPER_ADMIN":
            case "VIEWER":
                return true;
            default:
                return false;
        }
    }
}