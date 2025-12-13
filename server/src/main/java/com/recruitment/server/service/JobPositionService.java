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
    private final ScreeningCommentRepository screeningCommentRepository;
    private final NotificationService notificationService;

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
        JobPosition position = jobRepository.findById(positionId)
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
        // This would return notifications related to a position
        // Implementation depends on how you want to filter notifications
        return List.of();
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
}