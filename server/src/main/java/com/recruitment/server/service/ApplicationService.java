package com.recruitment.server.service;

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
public class ApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public JobApplication createApplication(Long candidateId, Long positionId, Long cvId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        // Check if application already exists
        List<JobApplication> existing = jobApplicationRepository
                .findByCandidateAndPosition(candidate, position);
        
        if (!existing.isEmpty()) {
            throw new RuntimeException("Application already exists for this candidate and position");
        }

        CandidateCV cv = null;
        if (cvId != null) {
            cv = candidateCVRepository.findById(cvId)
                    .orElseThrow(() -> new RuntimeException("CV not found"));
        }

        JobApplication application = JobApplication.builder()
                .candidate(candidate)
                .position(position)
                .cv(cv)
                .status(JobApplication.Status.APPLIED)
                .currentStage("NEW_APPLICATION")
                .appliedAt(LocalDateTime.now())
                .statusUpdatedAt(LocalDateTime.now())
                .build();

        JobApplication saved = jobApplicationRepository.save(application);

        // Notify recruiters
        if (position.getCreatedBy() != null) {
            notificationService.createNotification(
                position.getCreatedBy(),
                "New application received from " + candidate.getFirstName() + 
                " " + candidate.getLastName() + " for " + position.getJobTitle(),
                Notification.NotificationType.INFO,
                Notification.NotificationCategory.APPLICATION_STATUS,
                saved.getApplicationId()
            );
        }

        return saved;
    }

    public JobApplication updateApplicationStatus(Long applicationId, 
            JobApplication.Status status, String reason, User updatedBy) {
        
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        JobApplication.Status oldStatus = application.getStatus();
        application.setStatus(status);
        application.setStatusUpdatedAt(LocalDateTime.now());
        application.setStatusUpdatedBy(updatedBy);

        switch (status) {
            case ON_HOLD:
                application.setHoldReason(reason);
                application.setCurrentStage("ON_HOLD");
                break;
            case REJECTED:
                application.setRejectionReason(reason);
                application.setCurrentStage("REJECTED");
                break;
            case WITHDRAWN:
                application.setCurrentStage("WITHDRAWN");
                break;
            case SCREENING:
                application.setCurrentStage("UNDER_SCREENING");
                break;
            case INTERVIEW:
                application.setCurrentStage("PENDING_INTERVIEW");
                break;
            case SELECTED:
                application.setCurrentStage("SELECTED");
                break;
        }

        JobApplication updated = jobApplicationRepository.save(application);

        // Send notification about status change
        String message = "Application status changed from " + oldStatus + " to " + status;
        if (reason != null && !reason.trim().isEmpty()) {
            message += ". Reason: " + reason;
        }

        // Notify candidate (if they have user account) and relevant staff
        // Implementation depends on your notification requirements

        return updated;
    }

    public JobApplication moveToHold(Long applicationId, String reason, User updatedBy) {
        return updateApplicationStatus(applicationId, JobApplication.Status.ON_HOLD, reason, updatedBy);
    }

    public JobApplication rejectApplication(Long applicationId, String reason, User updatedBy) {
        return updateApplicationStatus(applicationId, JobApplication.Status.REJECTED, reason, updatedBy);
    }

    public JobApplication moveToScreening(Long applicationId, User updatedBy) {
        return updateApplicationStatus(applicationId, JobApplication.Status.SCREENING, null, updatedBy);
    }

    public JobApplication moveToInterview(Long applicationId, User updatedBy) {
        return updateApplicationStatus(applicationId, JobApplication.Status.INTERVIEW, null, updatedBy);
    }

    public JobApplication selectCandidate(Long applicationId, User updatedBy) {
        JobApplication application = updateApplicationStatus(
            applicationId, JobApplication.Status.SELECTED, null, updatedBy
        );

        // Update position if this is the first selected candidate
        JobPosition position = application.getPosition();
        if (position.getSelectedCandidate() == null) {
            position.setSelectedCandidate(application.getCandidate());
            jobRepository.save(position);
        }

        return application;
    }

    public List<JobApplication> getApplicationsByPosition(Long positionId) {
        return jobApplicationRepository.findByPositionPositionId(positionId);
    }

    public List<JobApplication> getApplicationsByCandidate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        return jobApplicationRepository.findByCandidate(candidate);
    }

    public List<JobApplication> getApplicationsByStatus(JobApplication.Status status) {
        return jobApplicationRepository.findByStatus(status);
    }

    public JobApplication getApplicationById(Long applicationId) {
        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    public void deleteApplication(Long applicationId) {
        jobApplicationRepository.deleteById(applicationId);
    }
}
