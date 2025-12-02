package com.recruitment.server.controller;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    @PostMapping("/rounds/define")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
    public ResponseEntity<?> defineInterviewRounds(@RequestParam Long positionId,
            @RequestBody List<InterviewRound> rounds) {
        try {
            List<InterviewRound> savedRounds = interviewService.defineInterviewRounds(positionId, rounds);
            return ResponseEntity.ok(savedRounds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/rounds/position/{positionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getRoundsByPosition(@PathVariable Long positionId) {
        try {
            List<InterviewRound> rounds = interviewService.getRoundsByPosition(positionId);
            return ResponseEntity.ok(rounds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
    public ResponseEntity<?> scheduleInterview(@RequestBody Map<String, Object> scheduleData,
            Authentication authentication) {
        try {
            Long applicationId = Long.valueOf(scheduleData.get("applicationId").toString());
            Long roundId = Long.valueOf(scheduleData.get("roundId").toString());
            LocalDateTime interviewDate = LocalDateTime.parse(scheduleData.get("interviewDate").toString());
            CandidateInterview.InterviewMode mode = CandidateInterview.InterviewMode
                    .valueOf(scheduleData.get("mode").toString());
            String interviewLink = scheduleData.get("interviewLink") != null
                    ? scheduleData.get("interviewLink").toString()
                    : null;

            @SuppressWarnings("unchecked")
            List<Long> panelistIds = scheduleData.get("panelistIds") != null
                    ? (List<Long>) scheduleData.get("panelistIds")
                    : new ArrayList<>();

            User scheduledBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CandidateInterview interview = interviewService.scheduleInterview(
                    applicationId, roundId, interviewDate, mode, interviewLink, panelistIds, scheduledBy);

            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk-schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
    public ResponseEntity<?> scheduleBulkInterviews(@RequestBody Map<String, Object> bulkData,
            Authentication authentication) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> applicationIds = (List<Long>) bulkData.get("applicationIds");
            Long roundId = Long.valueOf(bulkData.get("roundId").toString());
            LocalDateTime interviewDate = LocalDateTime.parse(bulkData.get("interviewDate").toString());
            CandidateInterview.InterviewMode mode = CandidateInterview.InterviewMode
                    .valueOf(bulkData.get("mode").toString());
            String interviewLink = bulkData.get("interviewLink") != null
                    ? bulkData.get("interviewLink").toString()
                    : null;

            @SuppressWarnings("unchecked")
            List<Long> panelistIds = bulkData.get("panelistIds") != null
                    ? (List<Long>) bulkData.get("panelistIds")
                    : new ArrayList<>();

            User scheduledBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<CandidateInterview> interviews = interviewService.scheduleBulkInterviews(
                    applicationIds, roundId, interviewDate, mode, interviewLink, panelistIds, scheduledBy);

            return ResponseEntity.ok(Map.of(
                    "scheduled", interviews.size(),
                    "interviews", interviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{interviewId}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
    public ResponseEntity<?> rescheduleInterview(@PathVariable Long interviewId,
            @RequestParam String newDate) {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(newDate);
            CandidateInterview interview = interviewService.rescheduleInterview(interviewId, dateTime);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{interviewId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR')")
    public ResponseEntity<?> cancelInterview(@PathVariable Long interviewId) {
        try {
            CandidateInterview interview = interviewService.cancelInterview(interviewId);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{interviewId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR', 'INTERVIEWER')")
    public ResponseEntity<?> completeInterview(@PathVariable Long interviewId) {
        try {
            CandidateInterview interview = interviewService.completeInterview(interviewId);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{interviewId}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'HR', 'INTERVIEWER')")
    public ResponseEntity<?> submitFeedback(@PathVariable Long interviewId,
            @RequestBody InterviewFeedback feedback,
            Authentication authentication) {
        try {
            User panelist = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            InterviewFeedback savedFeedback = interviewService.submitInterviewFeedback(
                    interviewId, panelist.getUserId(), feedback);

            return ResponseEntity.ok(savedFeedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getInterviewsByApplication(@PathVariable Long applicationId) {
        try {
            List<CandidateInterview> interviews = interviewService.getInterviewsByApplication(applicationId);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-interviews")
    @PreAuthorize("hasAnyRole('INTERVIEWER', 'HR', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<?> getMyInterviews(Authentication authentication) {
        try {
            User panelist = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<CandidateInterview> interviews = interviewService.getInterviewsByPanelist(panelist.getUserId());
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{interviewId}/feedback")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFeedbackByInterview(@PathVariable Long interviewId) {
        try {
            List<InterviewFeedback> feedbacks = interviewService.getFeedbacksByInterview(interviewId);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Legacy endpoint for compatibility
    @PostMapping("/simulate-online")
    public ResponseEntity<?> simulateOnlineInterview(@RequestParam Long candidateId) {
        Random random = new Random();
        int marks = random.nextInt(101);
        return ResponseEntity.ok(Map.of("candidateId", candidateId, "marks", marks));
    }
}