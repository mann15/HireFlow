package com.recruitment.server.controller;

import com.recruitment.server.dto.ScreeningFeedbackDTO;
import com.recruitment.server.service.ScreeningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ScreeningService screeningService;

    /**
     * Get all reviews (screening feedback) for the current reviewer
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<List<ScreeningFeedbackDTO>> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long applicationId,
            Authentication authentication) {
        // Return all feedback accessible to this reviewer
        // For now, return all feedback records since the reviewer can access them
        return ResponseEntity.ok(screeningService.getAllFeedback());
    }

    /**
     * Get a specific review by ID
     */
    @GetMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> getReviewById(@PathVariable Long reviewId) {
        try {
            ScreeningFeedbackDTO feedback = screeningService.getFeedbackById(reviewId);
            return ResponseEntity.ok(feedback);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Submit a new review
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> createReview(@RequestBody ScreeningFeedbackDTO reviewData) {
        return ResponseEntity.ok(screeningService.submitScreeningFeedback(reviewData));
    }

    /**
     * Update an existing review
     */
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ScreeningFeedbackDTO reviewData) {
        return ResponseEntity.ok(screeningService.updateScreeningFeedback(reviewId, reviewData));
    }

    /**
     * Delete a review
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        screeningService.deleteScreeningFeedback(reviewId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get reviews for a specific application
     */
    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER','INTERVIEWER','VIEWER')")
    public ResponseEntity<List<ScreeningFeedbackDTO>> getApplicationReviews(@PathVariable Long applicationId) {
        return ResponseEntity.ok(screeningService.getFeedbacksByApplicationId(applicationId));
    }

    /**
     * Submit feedback for a review
     */
    @PostMapping("/{reviewId}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','REVIEWER')")
    public ResponseEntity<ScreeningFeedbackDTO> submitReviewFeedback(
            @PathVariable Long reviewId,
            @RequestBody ScreeningFeedbackDTO feedback) {
        return ResponseEntity.ok(screeningService.submitScreeningFeedback(feedback));
    }
}
