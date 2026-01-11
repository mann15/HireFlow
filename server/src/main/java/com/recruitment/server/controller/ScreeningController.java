package com.recruitment.server.controller;

import com.recruitment.server.dto.CandidateHistoryNotificationDTO;
import com.recruitment.server.dto.ScreeningCommentDTO;
import com.recruitment.server.dto.ScreeningFeedbackDTO;
import com.recruitment.server.service.ScreeningService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/screening")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;

    @PostMapping("/feedback")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> submitFeedback(@Valid @RequestBody ScreeningFeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(screeningService.submitScreeningFeedback(feedbackDTO));
    }

    @GetMapping("/feedback/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<List<ScreeningFeedbackDTO>> getFeedbacksByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(screeningService.getFeedbacksByApplicationId(applicationId));
    }

    @GetMapping("/feedback/application/{applicationId}/latest")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> getLatestFeedback(@PathVariable Long applicationId) {
        ScreeningFeedbackDTO feedback = screeningService.getLatestFeedbackByApplicationIdSingle(applicationId);
        if (feedback == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(feedback);
    }

    @PostMapping("/comments")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<ScreeningCommentDTO> addComment(@RequestBody ScreeningCommentDTO commentDTO) {
        return ResponseEntity.ok(screeningService.addComment(commentDTO));
    }

    @GetMapping("/comments/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<List<ScreeningCommentDTO>> getCommentsByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(screeningService.getCommentsByApplicationId(applicationId));
    }

    @GetMapping("/notifications/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<List<CandidateHistoryNotificationDTO>> getNotificationsByApplication(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(screeningService.getHistoryNotificationsByApplicationId(applicationId));
    }

    @PutMapping("/notifications/{notificationId}/mark-viewed")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER')")
    public ResponseEntity<Void> markNotificationAsViewed(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        screeningService.markNotificationAsViewed(notificationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/application/{applicationId}/check-history")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<Void> checkPreviousCandidateHistory(@PathVariable Long applicationId) {
        screeningService.checkPreviousCandidateHistoryAndCreateNotifications(applicationId);
        return ResponseEntity.ok().build();
    }
}