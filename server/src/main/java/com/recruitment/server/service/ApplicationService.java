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
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final PositionReviewerRepository positionReviewerRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;
    private final InterviewPanelRepository interviewPanelRepository;

    private void notifyStatusChange(JobApplication application, JobApplication.Status oldStatus,
            String reason) {
        Candidate candidate = application.getCandidate();
        JobPosition position = application.getPosition();

        String message = "Application status changed from " + oldStatus + " to " + application.getStatus();
        if (reason != null && !reason.trim().isEmpty()) {
            message += ". Reason: " + reason;
        }

        String subject = "Application update: " + position.getJobTitle() + " - " + application.getStatus();
        String body = message;

        // Notify candidate (if a user account exists)
        if (candidate.getUser() != null) {
            notificationService.createNotification(
                    candidate.getUser(),
                    message,
                    Notification.NotificationType.INFO,
                    Notification.NotificationCategory.APPLICATION_STATUS,
                    application.getApplicationId());
            emailService.sendEmail(candidate.getUser().getEmail(), subject, body);
        }

        // Notify position owner and last updater
        if (position.getCreatedBy() != null) {
            notificationService.createNotification(
                    position.getCreatedBy(),
                    "Candidate " + candidate.getFirstName() + " " + candidate.getLastName() +
                            " status changed: " + application.getStatus(),
                    Notification.NotificationType.INFO,
                    Notification.NotificationCategory.APPLICATION_STATUS,
                    application.getApplicationId());
            emailService.sendEmail(position.getCreatedBy().getEmail(), subject, body);
        }

        if (application.getStatusUpdatedBy() != null
                && (position.getCreatedBy() == null
                        || !position.getCreatedBy().getUserId().equals(application.getStatusUpdatedBy().getUserId()))) {
            notificationService.createNotification(
                    application.getStatusUpdatedBy(),
                    message,
                    Notification.NotificationType.INFO,
                    Notification.NotificationCategory.APPLICATION_STATUS,
                    application.getApplicationId());
            emailService.sendEmail(application.getStatusUpdatedBy().getEmail(), subject, body);
        }
    }

    private void sendPendingActionReminders(JobApplication application) {
        JobApplication.Status status = application.getStatus();
        Candidate candidate = application.getCandidate();
        JobPosition position = application.getPosition();

        String reminder = null;
        switch (status) {
            case ON_HOLD:
                reminder = "Application for " + candidate.getFirstName() + " " + candidate.getLastName()
                        + " is on hold. Please review hold reason and next steps.";
                break;
            case SCREENING:
                reminder = "Screening pending for candidate " + candidate.getFirstName() + " "
                        + candidate.getLastName() + ". Collect reviewer feedback.";
                break;
            case INTERVIEW:
                reminder = "Interviews pending for candidate " + candidate.getFirstName() + " "
                        + candidate.getLastName() + ". Schedule/complete interviews.";
                break;
            case SELECTED:
                reminder = "Offer/Joining actions pending for candidate " + candidate.getFirstName() + " "
                        + candidate.getLastName() + ". Generate offer and confirm joining.";
                break;
            default:
                break;
        }

        if (reminder != null) {
            String subject = "Reminder: Application " + status + " for " + candidate.getFirstName()
                    + " " + candidate.getLastName();
            if (position.getCreatedBy() != null) {
                notificationService.createNotification(
                        position.getCreatedBy(),
                        reminder,
                        Notification.NotificationType.INFO,
                        Notification.NotificationCategory.APPLICATION_STATUS,
                        application.getApplicationId());
                emailService.sendEmail(position.getCreatedBy().getEmail(), subject, reminder);
            }
            if (application.getStatusUpdatedBy() != null) {
                notificationService.createNotification(
                        application.getStatusUpdatedBy(),
                        reminder,
                        Notification.NotificationType.INFO,
                        Notification.NotificationCategory.APPLICATION_STATUS,
                        application.getApplicationId());
                emailService.sendEmail(application.getStatusUpdatedBy().getEmail(), subject, reminder);
            }
        }
    }

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
                    saved.getApplicationId());
        }

        return saved;
    }

    public JobApplication updateApplicationStatus(Long applicationId,
            JobApplication.Status status, String reason, User updatedBy) {

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(
                        () -> new com.recruitment.server.exception.ResourceNotFoundException("Application not found"));

        if (status == JobApplication.Status.ON_HOLD && (reason == null || reason.trim().isEmpty())) {
            throw new RuntimeException("Reason is required to move an application to ON_HOLD");
        }

        JobApplication.Status oldStatus = application.getStatus();

        // Validate transition-specific rules
        if (status == JobApplication.Status.SCREENING) {
            if (oldStatus == JobApplication.Status.SCREENING) {
                throw new com.recruitment.server.exception.InvalidTransitionException(
                        "Application already in SCREENING");
            }
            if (oldStatus == JobApplication.Status.SELECTED
                    || oldStatus == JobApplication.Status.REJECTED
                    || oldStatus == JobApplication.Status.WITHDRAWN) {
                throw new com.recruitment.server.exception.InvalidTransitionException(
                        "Cannot move from " + oldStatus + " to SCREENING");
            }
            if (!(oldStatus == JobApplication.Status.APPLIED || oldStatus == JobApplication.Status.ON_HOLD)) {
                throw new com.recruitment.server.exception.InvalidTransitionException(
                        "Only APPLIED or ON_HOLD applications can move to SCREENING");
            }
            if (application.getCv() == null) {
                // If CV not explicitly attached to the application, try to auto-attach
                // an existing CV for the candidate (if present).
                candidateCVRepository.findByCandidate(application.getCandidate()).ifPresent(application::setCv);

                if (application.getCv() == null) {
                    throw new com.recruitment.server.exception.MissingDataException(
                            "CV is required to move to SCREENING");
                }
            }
        }
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
            case APPLIED:
            default:
                // APPLIED is the default status, no special handling needed
                break;
        }

        JobApplication updated = jobApplicationRepository.save(application);
        notifyStatusChange(updated, oldStatus, reason);
        sendPendingActionReminders(updated);
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

    public JobApplication attachCvToApplication(Long applicationId, Long cvId, User updatedBy) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(
                        () -> new com.recruitment.server.exception.ResourceNotFoundException("Application not found"));

        CandidateCV cv = candidateCVRepository.findById(cvId)
                .orElseThrow(() -> new com.recruitment.server.exception.ResourceNotFoundException("CV not found"));

        // Ensure the CV belongs to the same candidate as the application
        if (!cv.getCandidate().getCandidateId().equals(application.getCandidate().getCandidateId())) {
            throw new com.recruitment.server.exception.InvalidTransitionException(
                    "CV does not belong to the application candidate");
        }

        application.setCv(cv);
        application.setStatusUpdatedBy(updatedBy);
        JobApplication updated = jobApplicationRepository.save(application);
        return updated;
    }

    public JobApplication moveToInterview(Long applicationId, User updatedBy) {
        return updateApplicationStatus(applicationId, JobApplication.Status.INTERVIEW, null, updatedBy);
    }

    public JobApplication selectCandidate(Long applicationId, User updatedBy) {
        JobApplication application = updateApplicationStatus(
                applicationId, JobApplication.Status.SELECTED, null, updatedBy);

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

    /**
     * Get applications filtered by user role
     * - REVIEWER: Only applications for positions they're assigned to
     * - INTERVIEWER: Only applications for interviews they're assigned to
     * - RECRUITER: Only applications for positions they created
     * - HR: All applications (can see all for culture fit, negotiation,
     * documentation)
     * - ADMIN/SUPER_ADMIN: All applications
     * - VIEWER: All applications (read-only)
     */
    public List<JobApplication> getApplicationsByRole(User user) {
        String roleName = user.getRole().getRoleName();

        switch (roleName) {
            case "REVIEWER":
                return jobApplicationRepository.findByReviewerId(user.getUserId());
            case "INTERVIEWER":
                return jobApplicationRepository.findByInterviewerId(user.getUserId());
            case "RECRUITER":
                return jobApplicationRepository.findByRecruiterId(user.getUserId());
            case "HR":
            case "ADMIN":
            case "SUPER_ADMIN":
            case "VIEWER":
                return jobApplicationRepository.findAll();
            default:
                // For unknown roles, return empty list for security
                return List.of();
        }
    }

    /**
     * Check if user has access to a specific application based on their role
     */
    public boolean hasAccessToApplication(User user, JobApplication application) {
        String roleName = user.getRole().getRoleName();

        switch (roleName) {
            case "REVIEWER":
                // Check if reviewer is assigned to the position
                return positionReviewerRepository.existsByPositionAndReviewer(
                        application.getPosition(), user);
            case "INTERVIEWER":
                // Check if interviewer is assigned to any interview for this application
                List<CandidateInterview> interviews = candidateInterviewRepository.findByApplication(application);
                for (CandidateInterview interview : interviews) {
                    List<InterviewPanel> panels = interviewPanelRepository.findByInterview(interview);
                    for (InterviewPanel panel : panels) {
                        if (panel.getPanelist().getUserId().equals(user.getUserId())) {
                            return true;
                        }
                    }
                }
                return false;
            case "RECRUITER":
                // Check if recruiter created the position
                return application.getPosition().getCreatedBy() != null &&
                        application.getPosition().getCreatedBy().getUserId().equals(user.getUserId());
            case "CANDIDATE":
                // Check if candidate is the applicant
                return application.getCandidate().getUser() != null &&
                        application.getCandidate().getUser().getUserId().equals(user.getUserId());
            case "HR":
            case "ADMIN":
            case "SUPER_ADMIN":
            case "VIEWER":
                return true;
            default:
                return false;
        }
    }

    public void deleteApplication(Long applicationId) {
        jobApplicationRepository.deleteById(applicationId);
    }
}
