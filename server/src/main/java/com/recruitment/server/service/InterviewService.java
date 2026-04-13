package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class InterviewService {

    private final CandidateInterviewRepository candidateInterviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final InterviewPanelRepository interviewPanelRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final NotificationService notificationService;

    public List<InterviewRound> defineInterviewRounds(Long positionId, Long candidateId, List<InterviewRound> rounds) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        Candidate candidate = null;
        if (candidateId != null) {
            candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));
        }

        List<InterviewRound> savedRounds = new ArrayList<>();

        for (InterviewRound round : rounds) {
            round.setPosition(position);
            round.setCandidate(candidate);
            savedRounds.add(interviewRoundRepository.save(round));
        }

        return savedRounds;
    }

    public InterviewRound updateInterviewRound(Long roundId, InterviewRound updatedRound) {
        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Interview round not found"));

        round.setRoundName(updatedRound.getRoundName());
        round.setRoundType(updatedRound.getRoundType());
        round.setRoundOrder(updatedRound.getRoundOrder());
        round.setIsMandatory(updatedRound.getIsMandatory());
        round.setDurationMinutes(updatedRound.getDurationMinutes());
        round.setDescription(updatedRound.getDescription());

        return interviewRoundRepository.save(round);
    }

    public void deleteInterviewRound(Long roundId) {
        if (!interviewRoundRepository.existsById(roundId)) {
            throw new RuntimeException("Interview round not found");
        }
        interviewRoundRepository.deleteById(roundId);
    }

    public CandidateInterview scheduleInterview(Long applicationId, Long roundId, Map<String, Object> customRound,
            LocalDateTime interviewDate, CandidateInterview.InterviewMode mode,
            String interviewLink, List<Long> panelistIds, User scheduledBy) {

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        InterviewRound round;
        if (roundId != null) {
            round = interviewRoundRepository.findById(roundId)
                    .orElseThrow(() -> new RuntimeException("Interview round not found"));
        } else if (customRound != null) {
            String roundName = customRound.get("roundName") != null ? customRound.get("roundName").toString()
                    : "Custom Round";
            String roundTypeStr = customRound.get("roundType") != null ? customRound.get("roundType").toString()
                    : "TECHNICAL";
            InterviewRound.RoundType roundType = InterviewRound.RoundType.valueOf(roundTypeStr);
            Integer duration = customRound.get("durationMinutes") != null
                    ? Integer.valueOf(customRound.get("durationMinutes").toString())
                    : 60;
            String description = customRound.get("description") != null
                    ? customRound.get("description").toString()
                    : "Custom round";

            round = InterviewRound.builder()
                    .position(application.getPosition())
                    .roundName(roundName)
                    .roundType(roundType)
                    .durationMinutes(duration)
                    .description(description)
                    .roundOrder(0)
                    .isMandatory(true)
                    .build();
            round = interviewRoundRepository.save(round);
        } else {
            throw new RuntimeException("Either roundId or customRound must be provided");
        }

        // Create interview
        CandidateInterview interview = CandidateInterview.builder()
                .application(application)
                .round(round)
                .interviewDate(interviewDate)
                .interviewMode(mode)
                .interviewLink(interviewLink)
                .status(CandidateInterview.InterviewStatus.SCHEDULED)
                .scheduledAt(LocalDateTime.now())
                .user(scheduledBy)
                .build();

        CandidateInterview savedInterview = candidateInterviewRepository.save(interview);

        // Add panelists
        if (panelistIds != null && !panelistIds.isEmpty()) {
            for (Long panelistId : panelistIds) {
                User panelist = userRepository.findById(panelistId)
                        .orElseThrow(() -> new RuntimeException("Panelist not found: " + panelistId));

                InterviewPanel panel = InterviewPanel.builder()
                        .interview(savedInterview)
                        .panelist(panelist)
                        .build();

                interviewPanelRepository.save(panel);

                // Send notification to panelist
                notificationService.createNotification(
                        panelist,
                        "You have been assigned to interview " +
                                application.getCandidate().getFirstName() + " " +
                                application.getCandidate().getLastName() +
                                " on " + interviewDate.toString(),
                        Notification.NotificationType.INFO,
                        Notification.NotificationCategory.INTERVIEW_SCHEDULED,
                        savedInterview.getInterviewId());
            }
        }

        // Update application status
        application.setStatus(JobApplication.Status.INTERVIEW);
        application.setCurrentStage("INTERVIEW_SCHEDULED");
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);

        return savedInterview;
    }

    public List<CandidateInterview> scheduleBulkInterviews(List<Long> applicationIds,
            Long roundId, LocalDateTime interviewDate,
            CandidateInterview.InterviewMode mode, String interviewLink,
            List<Long> panelistIds, User scheduledBy) {

        List<CandidateInterview> scheduledInterviews = new ArrayList<>();

        for (Long applicationId : applicationIds) {
            try {
                CandidateInterview interview = scheduleInterview(
                        applicationId, roundId, null, interviewDate, mode,
                        interviewLink, panelistIds, scheduledBy);
                scheduledInterviews.add(interview);
            } catch (Exception e) {
                // Log error and continue with next application
                System.err.println("Failed to schedule interview for application " +
                        applicationId + ": " + e.getMessage());
            }
        }

        return scheduledInterviews;
    }

    public Long resolveBulkRoundId(Long positionId, Long roundId) {
        if (roundId != null) {
            return roundId;
        }

        if (positionId == null) {
            throw new RuntimeException("positionId is required when roundId is not provided");
        }

        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        InterviewRound round = interviewRoundRepository.findByPositionOrderByRoundOrder(position)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No interview rounds defined for this position"));

        return round.getRoundId();
    }

    public List<Long> resolveApplicationIdsForBulkScheduling(Long positionId, List<Long> candidateIds) {
        if (positionId == null) {
            throw new RuntimeException("positionId is required when candidateIds are used for bulk scheduling");
        }
        if (candidateIds == null || candidateIds.isEmpty()) {
            return List.of();
        }

        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        List<Long> applicationIds = new ArrayList<>();
        for (Long candidateId : candidateIds) {
            Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found: " + candidateId));

            List<JobApplication> applications = jobApplicationRepository.findByCandidateAndPosition(candidate,
                    position);
            if (applications.isEmpty()) {
                throw new RuntimeException("No application found for candidate " + candidateId + " on position "
                        + positionId);
            }

            for (JobApplication application : applications) {
                if (application.getApplicationId() != null
                        && !applicationIds.contains(application.getApplicationId())) {
                    applicationIds.add(application.getApplicationId());
                }
            }
        }

        return applicationIds;
    }

    public CandidateInterview rescheduleInterview(Long interviewId, LocalDateTime newDate) {
        CandidateInterview interview = candidateInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setInterviewDate(newDate);
        interview.setStatus(CandidateInterview.InterviewStatus.RESCHEDULED);

        CandidateInterview updated = candidateInterviewRepository.save(interview);

        // Notify panelists about reschedule
        List<InterviewPanel> panels = interviewPanelRepository.findByInterview(interview);
        for (InterviewPanel panel : panels) {
            notificationService.createNotification(
                    panel.getPanelist(),
                    "Interview with " +
                            interview.getApplication().getCandidate().getFirstName() + " " +
                            interview.getApplication().getCandidate().getLastName() +
                            " has been rescheduled to " + newDate.toString(),
                    Notification.NotificationType.WARNING,
                    Notification.NotificationCategory.INTERVIEW_SCHEDULED,
                    interviewId);
        }

        return updated;
    }

    public CandidateInterview cancelInterview(Long interviewId) {
        CandidateInterview interview = candidateInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(CandidateInterview.InterviewStatus.CANCELED);
        return candidateInterviewRepository.save(interview);
    }

    public CandidateInterview completeInterview(Long interviewId) {
        CandidateInterview interview = candidateInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(CandidateInterview.InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());

        return candidateInterviewRepository.save(interview);
    }

    public InterviewFeedback submitInterviewFeedback(Long interviewId, Long panelistId,
            InterviewFeedback feedback) {

        CandidateInterview interview = candidateInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        User panelist = userRepository.findById(panelistId)
                .orElseThrow(() -> new RuntimeException("Panelist not found"));

        feedback.setInterview(interview);
        feedback.setPanelist(panelist);

        InterviewFeedback saved = interviewFeedbackRepository.save(feedback);

        // Check if all panelists have submitted feedback
        List<InterviewPanel> panels = interviewPanelRepository.findByInterview(interview);
        List<InterviewFeedback> feedbacks = interviewFeedbackRepository.findByInterview(interview);

        if (panels.size() == feedbacks.size()) {
            // All panelists have given feedback, mark interview as completed
            interview.setStatus(CandidateInterview.InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            candidateInterviewRepository.save(interview);
        }

        return saved;
    }

    public List<CandidateInterview> getInterviewsByApplication(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return candidateInterviewRepository.findByApplication(application);
    }

    public List<CandidateInterview> getInterviewsByPanelist(Long panelistId) {
        User panelist = userRepository.findById(panelistId)
                .orElseThrow(() -> new RuntimeException("Panelist not found"));

        List<InterviewPanel> panels = interviewPanelRepository.findByPanelist(panelist);
        List<CandidateInterview> interviews = new ArrayList<>();

        for (InterviewPanel panel : panels) {
            interviews.add(panel.getInterview());
        }

        return interviews;
    }

    public List<InterviewFeedback> getFeedbacksByInterview(Long interviewId) {
        CandidateInterview interview = candidateInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        return interviewFeedbackRepository.findByInterview(interview);
    }

    public InterviewFeedback updateInterviewFeedback(Long interviewId, Long feedbackId,
            Long requesterUserId, boolean canAdminEdit, InterviewFeedback payload) {
        InterviewFeedback feedback = interviewFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (feedback.getInterview() == null || feedback.getInterview().getInterviewId() == null
                || !feedback.getInterview().getInterviewId().equals(interviewId)) {
            throw new RuntimeException("Feedback does not belong to the specified interview");
        }

        Long ownerId = feedback.getPanelist() != null ? feedback.getPanelist().getUserId() : null;
        if (ownerId == null) {
            throw new RuntimeException("Feedback has no panelist owner");
        }

        if (!ownerId.equals(requesterUserId) && !canAdminEdit) {
            throw new RuntimeException("Not authorized to edit this feedback");
        }

        // Update editable fields
        feedback.setFeedback_comments(payload.getFeedback_comments());
        feedback.setOverall_rating(payload.getOverall_rating());
        feedback.setCommunication_skills(payload.getCommunication_skills());
        feedback.setTechnical_knowledge(payload.getTechnical_knowledge());
        feedback.setCultural_fit_rating(payload.getCultural_fit_rating());
        feedback.setRecommendation(payload.getRecommendation());
        feedback.setStrengths(payload.getStrengths());
        feedback.setAreas_of_improvement(payload.getAreas_of_improvement());
        feedback.setStage(payload.getStage());
        feedback.setHr_notes(payload.getHr_notes());

        return interviewFeedbackRepository.save(feedback);
    }

    public void deleteInterviewFeedback(Long interviewId, Long feedbackId, Long requesterUserId,
            boolean canAdminDelete) {
        InterviewFeedback feedback = interviewFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (feedback.getInterview() == null || feedback.getInterview().getInterviewId() == null
                || !feedback.getInterview().getInterviewId().equals(interviewId)) {
            throw new RuntimeException("Feedback does not belong to the specified interview");
        }

        Long ownerId = feedback.getPanelist() != null ? feedback.getPanelist().getUserId() : null;
        if (ownerId == null) {
            throw new RuntimeException("Feedback has no panelist owner");
        }

        if (!ownerId.equals(requesterUserId) && !canAdminDelete) {
            throw new RuntimeException("Not authorized to delete this feedback");
        }

        interviewFeedbackRepository.deleteById(feedbackId);

        // Recompute completion status after deletion
        CandidateInterview interview = feedback.getInterview();
        List<InterviewPanel> panels = interviewPanelRepository.findByInterview(interview);
        List<InterviewFeedback> feedbacks = interviewFeedbackRepository.findByInterview(interview);
        if (panels.size() != feedbacks.size()) {
            interview.setStatus(CandidateInterview.InterviewStatus.SCHEDULED);
            interview.setCompletedAt(null);
            candidateInterviewRepository.save(interview);
        }
    }

    public List<InterviewRound> getRoundsByPosition(Long positionId) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        return interviewRoundRepository.findByPosition(position);
    }
}
