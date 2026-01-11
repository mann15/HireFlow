package com.recruitment.server.service;

import com.recruitment.server.dto.CandidateHistoryNotificationDTO;
import com.recruitment.server.dto.ScreeningFeedbackDTO;
import com.recruitment.server.dto.CandidateSkillDTO;
import com.recruitment.server.dto.ScreeningCommentDTO;
import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScreeningService {
    private final ScreeningFeedbackRepository screeningFeedbackRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ScreeningCommentRepository screeningCommentRepository;
    private final CandidateSkillsRepository candidateSkillsRepository;
    private final PositionReviewerRepository positionReviewerRepository;
    private final UserRepository userRepository;
    private final SkillsRepository skillsRepository;
    private final ProficiencyLevelsRepository proficiencyLevelsRepository;
    private final CandidateHistoryNotificationRepository notificationRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ScreeningFeedbackDTO submitScreeningFeedback(ScreeningFeedbackDTO feedbackDTO) {
        if (feedbackDTO.getApplicationId() == null || feedbackDTO.getReviewerId() == null
                || feedbackDTO.getRecommendation() == null) {
            throw new IllegalArgumentException("applicationId, reviewerId, and recommendation are required");
        }

        // Get the application
        JobApplication application = jobApplicationRepository.findById(feedbackDTO.getApplicationId())
                .orElseThrow(
                        () -> new RuntimeException("Application not found with id: " + feedbackDTO.getApplicationId()));

        // Get the reviewer
        User reviewer = userRepository.findById(feedbackDTO.getReviewerId())
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + feedbackDTO.getReviewerId()));

        // Check if reviewer is assigned to the position
        if (!positionReviewerRepository.existsByPositionAndReviewer(application.getPosition(), reviewer)) {
            throw new RuntimeException("Reviewer is not assigned to this position");
        }

        // Create and save the screening feedback
        ScreeningFeedback feedback = ScreeningFeedback.builder()
                .application(application)
                .reviewer(reviewer)
                .comments(feedbackDTO.getComments())
                .score(feedbackDTO.getScore())
                .recommendation(feedbackDTO.getRecommendation())
                .reviewedAt(LocalDateTime.now())
                .build();

        ScreeningFeedback savedFeedback = screeningFeedbackRepository.save(feedback);

        // Update application status based on recommendation
        updateApplicationStatusBasedOnFeedback(application, feedbackDTO.getRecommendation());

        // Process verified skills if available
        if (feedbackDTO.getVerifiedSkills() != null && !feedbackDTO.getVerifiedSkills().isEmpty()) {
            processVerifiedSkills(feedbackDTO.getVerifiedSkills(), application.getCandidate(), reviewer);
        }

        return mapToDTO(savedFeedback);
    }

    @Transactional
    public void updateApplicationStatusBasedOnFeedback(JobApplication application,
            ScreeningFeedback.Recommendation recommendation) {
        switch (recommendation) {
            case SHORTLIST:
                application.setStatus(JobApplication.Status.INTERVIEW);
                application.setCurrentStage("PENDING_INTERVIEW_SCHEDULING");
                break;
            case REJECT:
                application.setStatus(JobApplication.Status.REJECTED);
                application.setRejectionReason("Rejected during screening");
                break;
            case HOLD:
                application.setStatus(JobApplication.Status.ON_HOLD);
                application.setHoldReason("On hold after screening");
                break;
        }
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);
    }

    @Transactional
    public void processVerifiedSkills(List<CandidateSkillDTO> verifiedSkills, Candidate candidate, User verifier) {
        for (CandidateSkillDTO skillDTO : verifiedSkills) {
            if (skillDTO.getSkillId() == null) {
                continue;
            }

            // Find existing skill for this candidate
            List<CandidateSkills> existingSkills = candidateSkillsRepository.findByCandidate(candidate);
            Optional<CandidateSkills> existingSkill = existingSkills.stream()
                    .filter(cs -> cs.getSkill().getSkillId().equals(skillDTO.getSkillId()))
                    .findFirst();

            if (existingSkill.isPresent()) {
                // Update existing skill
                CandidateSkills skill = existingSkill.get();
                skill.setYearsOfExperience(skillDTO.getYearsOfExperience());
                skill.setVerified(true);
                skill.setVerifiedBy(verifier);

                ProficiencyLevels proficiencyLevel = proficiencyLevelsRepository
                        .findById(skillDTO.getProficiencyLevelId())
                        .orElse(skill.getProficiencyLevel());
                skill.setProficiencyLevel(proficiencyLevel);

                candidateSkillsRepository.save(skill);
            } else {
                // Create new skill
                Skills skill = skillsRepository.findById(skillDTO.getSkillId())
                        .orElseThrow(() -> new RuntimeException("Skill not found: " + skillDTO.getSkillId()));

                ProficiencyLevels proficiencyLevel = proficiencyLevelsRepository
                        .findById(skillDTO.getProficiencyLevelId())
                        .orElseThrow(() -> new RuntimeException(
                                "Proficiency level not found: " + skillDTO.getProficiencyLevelId()));

                CandidateSkills newSkill = CandidateSkills.builder()
                        .candidate(candidate)
                        .skill(skill)
                        .proficiencyLevel(proficiencyLevel)
                        .yearsOfExperience(skillDTO.getYearsOfExperience())
                        .verified(true)
                        .verifiedBy(verifier)
                        .build();

                candidateSkillsRepository.save(newSkill);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ScreeningFeedbackDTO> getFeedbacksByApplicationId(Long applicationId) {
        List<ScreeningFeedback> feedbacks = screeningFeedbackRepository.findByApplicationApplicationId(applicationId);
        return feedbacks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScreeningFeedbackDTO> getLatestFeedbackByApplicationId(Long applicationId) {
        return screeningFeedbackRepository.findTopByApplicationApplicationIdOrderByReviewedAtDesc(applicationId)
                .map(this::mapToDTO)
                .map(dto -> List.of(dto))
                .orElse(List.of());
    }

    /**
     * Get all screening feedback records
     */
    @Transactional(readOnly = true)
    public List<ScreeningFeedbackDTO> getAllFeedback() {
        List<ScreeningFeedback> feedbacks = screeningFeedbackRepository.findAll();
        return feedbacks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Get a specific feedback by ID
     */
    @Transactional(readOnly = true)
    public ScreeningFeedbackDTO getFeedbackById(Long feedbackId) {
        return screeningFeedbackRepository.findById(feedbackId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
    }

    /**
     * Update screening feedback
     */
    @Transactional
    public ScreeningFeedbackDTO updateScreeningFeedback(Long feedbackId, ScreeningFeedbackDTO feedbackDTO) {
        ScreeningFeedback feedback = screeningFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));

        feedback.setComments(feedbackDTO.getComments());
        feedback.setScore(feedbackDTO.getScore());
        feedback.setRecommendation(feedbackDTO.getRecommendation());

        ScreeningFeedback updatedFeedback = screeningFeedbackRepository.save(feedback);
        return mapToDTO(updatedFeedback);
    }

    /**
     * Delete screening feedback
     */
    @Transactional
    public void deleteScreeningFeedback(Long feedbackId) {
        ScreeningFeedback feedback = screeningFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
        screeningFeedbackRepository.delete(feedback);
    }

    @Transactional(readOnly = true)
    public ScreeningFeedbackDTO getLatestFeedbackByApplicationIdSingle(Long applicationId) {
        return screeningFeedbackRepository.findTopByApplicationApplicationIdOrderByReviewedAtDesc(applicationId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Transactional
    public ScreeningCommentDTO addComment(ScreeningCommentDTO commentDTO) {
        JobApplication application = jobApplicationRepository.findById(commentDTO.getApplicationId())
                .orElseThrow(
                        () -> new RuntimeException("Application not found with id: " + commentDTO.getApplicationId()));

        User user = userRepository.findById(commentDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + commentDTO.getUserId()));

        ScreeningComment comment = ScreeningComment.builder()
                .application(application)
                .user(user)
                .comment(commentDTO.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        ScreeningComment savedComment = screeningCommentRepository.save(comment);
        return mapToCommentDTO(savedComment);
    }

    @Transactional(readOnly = true)
    public List<ScreeningCommentDTO> getCommentsByApplicationId(Long applicationId) {
        List<ScreeningComment> comments = screeningCommentRepository
                .findByApplicationApplicationIdOrderByCreatedAtDesc(applicationId);
        return comments.stream().map(this::mapToCommentDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CandidateHistoryNotificationDTO> getHistoryNotificationsByApplicationId(Long applicationId) {
        List<CandidateHistoryNotification> notifications = notificationRepository
                .findByCurrentApplicationApplicationId(applicationId);
        return notifications.stream().map(this::mapToNotificationDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markNotificationAsViewed(Long notificationId, Long userId) {
        CandidateHistoryNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        notification.setViewed(true);
        notification.setViewedBy(user);
        notification.setViewedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    @Transactional
    public void checkPreviousCandidateHistoryAndCreateNotifications(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        // Don't create notification if one already exists
        if (notificationRepository.existsByApplicationIdAndType(applicationId, "SCREENING")) {
            return;
        }

        Candidate candidate = application.getCandidate();

        // Check if candidate has previous applications
        List<JobApplication> otherApplications = jobApplicationRepository.findOtherApplicationsByCandidate(
                candidate.getCandidateId(), applicationId);

        if (!otherApplications.isEmpty()) {
            StringBuilder message = new StringBuilder();
            message.append("Candidate was previously ");

            boolean hasScreening = screeningFeedbackRepository.existsByApplicationCandidate(candidate);
            if (hasScreening) {
                message.append("screened");

                // Check if candidate was also interviewed
                boolean hasInterview = !candidateInterviewRepository.findByApplication_Candidate(candidate).isEmpty();
                if (hasInterview) {
                    message.append(" and interviewed");
                }

                message.append(" for other position(s).");

                CandidateHistoryNotification notification = CandidateHistoryNotification.builder()
                        .candidate(candidate)
                        .currentApplication(application)
                        .notificationType("SCREENING")
                        .notificationMessage(message.toString())
                        .build();

                notificationRepository.save(notification);
            }
        }
    }

    private ScreeningFeedbackDTO mapToDTO(ScreeningFeedback feedback) {
        ScreeningFeedbackDTO dto = ScreeningFeedbackDTO.builder()
                .feedbackId(feedback.getFeedbackId())
                .applicationId(feedback.getApplication().getApplicationId())
                .reviewerId(feedback.getReviewer().getUserId())
                .reviewerName(feedback.getReviewer().getFirstName() + " " + feedback.getReviewer().getLastName())
                .comments(feedback.getComments())
                .score(feedback.getScore())
                .recommendation(feedback.getRecommendation())
                .reviewedAt(feedback.getReviewedAt().format(formatter))
                .build();

        // Add comments
        List<ScreeningComment> comments = screeningCommentRepository
                .findByApplicationApplicationIdOrderByCreatedAtDesc(feedback.getApplication().getApplicationId());
        dto.setScreeningComments(comments.stream().map(this::mapToCommentDTO).collect(Collectors.toList()));

        // Add verified skills
        List<CandidateSkills> verifiedSkills = candidateSkillsRepository
                .findByCandidate(feedback.getApplication().getCandidate())
                .stream()
                .filter(skill -> Boolean.TRUE.equals(skill.getVerified()))
                .collect(Collectors.toList());

        dto.setVerifiedSkills(verifiedSkills.stream().map(this::mapToSkillDTO).collect(Collectors.toList()));

        return dto;
    }

    private ScreeningCommentDTO mapToCommentDTO(ScreeningComment comment) {
        User user = comment.getUser();
        String userRole = user.getRole() != null ? user.getRole().getRoleName() : "Unknown";

        return ScreeningCommentDTO.builder()
                .commentId(comment.getCommentId())
                .applicationId(comment.getApplication().getApplicationId())
                .userId(user.getUserId())
                .userName(user.getFirstName() + " " + user.getLastName())
                .userRole(userRole)
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt().format(formatter))
                .build();
    }

    private CandidateSkillDTO mapToSkillDTO(CandidateSkills skill) {
        CandidateSkillDTO dto = CandidateSkillDTO.builder()
                .id(skill.getId())
                .skillId(skill.getSkill().getSkillId())
                .skillName(skill.getSkill().getSkillName())
                .proficiencyLevelId(skill.getProficiencyLevel().getLevelId())
                .proficiencyLevelName(skill.getProficiencyLevel().getLevelName())
                .yearsOfExperience(skill.getYearsOfExperience())
                .verified(skill.getVerified())
                .build();

        if (skill.getVerifiedBy() != null) {
            dto.setVerifiedById(skill.getVerifiedBy().getUserId());
            dto.setVerifiedByName(skill.getVerifiedBy().getFirstName() + " " + skill.getVerifiedBy().getLastName());
        }

        return dto;
    }

    private CandidateHistoryNotificationDTO mapToNotificationDTO(CandidateHistoryNotification notification) {
        CandidateHistoryNotificationDTO dto = CandidateHistoryNotificationDTO.builder()
                .id(notification.getId())
                .candidateId(notification.getCandidate().getCandidateId())
                .candidateName(
                        notification.getCandidate().getFirstName() + " " + notification.getCandidate().getLastName())
                .applicationId(notification.getCurrentApplication().getApplicationId())
                .notificationType(notification.getNotificationType())
                .notificationMessage(notification.getNotificationMessage())
                .viewed(notification.getViewed())
                .createdAt(notification.getCreatedAt().format(formatter))
                .build();

        if (notification.getViewedBy() != null) {
            dto.setViewedById(notification.getViewedBy().getUserId());
            dto.setViewedByName(
                    notification.getViewedBy().getFirstName() + " " + notification.getViewedBy().getLastName());
            dto.setViewedAt(notification.getViewedAt().format(formatter));
        }

        return dto;
    }
}