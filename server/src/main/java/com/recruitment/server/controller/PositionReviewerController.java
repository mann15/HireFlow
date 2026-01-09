package com.recruitment.server.controller;

import com.recruitment.server.dto.PositionReviewerDTO;
import com.recruitment.server.service.PositionReviewerService;
import com.recruitment.server.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/position-reviewers")
@RequiredArgsConstructor
public class PositionReviewerController {

    private final PositionReviewerService positionReviewerService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','INTERVIEWER')")
    public ResponseEntity<PositionReviewerDTO> assignReviewer(
            @RequestBody PositionReviewerDTO reviewerDTO,
            Authentication authentication) {
        // Get current user as assignedBy
        String email = authentication.getName();
        Long assignedById = userRepository.findByEmail(email)
                .map(u -> u.getUserId())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        reviewerDTO.setAssignedById(assignedById);

        return ResponseEntity.ok(positionReviewerService.assignReviewer(reviewerDTO));
    }

    @DeleteMapping("/{positionId}/{reviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','INTERVIEWER')")
    public ResponseEntity<Void> removeReviewer(@PathVariable Long positionId, @PathVariable Long reviewerId) {
        positionReviewerService.removeReviewer(positionId, reviewerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/position/{positionId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','REVIEWER','VIEWER')")
    public ResponseEntity<List<PositionReviewerDTO>> getReviewersByPosition(@PathVariable Long positionId) {
        return ResponseEntity.ok(positionReviewerService.getReviewersByPositionId(positionId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','REVIEWER','VIEWER')")
    public ResponseEntity<List<PositionReviewerDTO>> getPositionsByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(positionReviewerService.getPositionsByReviewerId(reviewerId));
    }
}