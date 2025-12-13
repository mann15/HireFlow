package com.recruitment.server.controller;

import com.recruitment.server.model.JobOffers;
import com.recruitment.server.model.User;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;
    private final UserRepository userRepository;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> generateOffer(@RequestBody Map<String, Object> offerData,
            Authentication authentication) {
        try {
            User createdBy = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long applicationId = Long.valueOf(offerData.get("applicationId").toString());
            BigDecimal salaryOffered = new BigDecimal(offerData.get("salaryOffered").toString());
            String offeredDesignation = offerData.get("offeredDesignation").toString();
            LocalDate joiningDate = LocalDate.parse(offerData.get("joiningDate").toString());
            LocalDate offerValidTill = LocalDate.parse(offerData.get("offerValidTill").toString());

            JobOffers offer = jobOfferService.generateOffer(
                    applicationId, salaryOffered, offeredDesignation,
                    joiningDate, offerValidTill, createdBy);

            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{offerId}/send")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> sendOffer(@PathVariable Long offerId) {
        try {
            JobOffers offer = jobOfferService.sendOffer(offerId);
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{offerId}/accept")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','CANDIDATE')")
    public ResponseEntity<?> acceptOffer(@PathVariable Long offerId) {
        try {
            JobOffers offer = jobOfferService.acceptOffer(offerId);
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{offerId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','CANDIDATE')")
    public ResponseEntity<?> rejectOffer(@PathVariable Long offerId,
            @RequestParam String reason) {
        try {
            JobOffers offer = jobOfferService.rejectOffer(offerId, reason);
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{offerId}/withdraw")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR')")
    public ResponseEntity<?> withdrawOffer(@PathVariable Long offerId) {
        try {
            JobOffers offer = jobOfferService.withdrawOffer(offerId);
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOffersByApplication(@PathVariable Long applicationId) {
        try {
            List<JobOffers> offers = jobOfferService.getOffersByApplication(applicationId);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{offerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOfferById(@PathVariable Long offerId) {
        try {
            JobOffers offer = jobOfferService.getOfferById(offerId);
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER')")
    public ResponseEntity<?> getOffers(@RequestParam(required = false) String status) {
        try {
            List<JobOffers> offers;

            if (status != null) {
                offers = jobOfferService.getOffersByStatus(JobOffers.OfferStatus.valueOf(status));
            } else {
                // Return all offers - implement in service if needed
                offers = List.of();
            }

            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
