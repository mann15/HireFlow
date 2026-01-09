package com.recruitment.server.controller;

import com.recruitment.server.model.JobOffers;
import com.recruitment.server.model.User;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.service.JobOfferService;
import com.recruitment.server.security.Roles;
import lombok.RequiredArgsConstructor;
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

            Long applicationId = parseLongRequired(offerData, "applicationId");
            BigDecimal salaryOffered = parseBigDecimalRequired(offerData, "salaryOffered");
            String offeredDesignation = parseStringRequired(offerData, "offeredDesignation");
            LocalDate joiningDate = parseLocalDateRequired(offerData, "joiningDate");
            LocalDate offerValidTill = parseLocalDateRequired(offerData, "offerValidTill");

            JobOffers offer = jobOfferService.generateOffer(
                    applicationId, salaryOffered, offeredDesignation,
                    joiningDate, offerValidTill, createdBy);

            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CANDIDATE')")
    public ResponseEntity<?> getMyOffers(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<JobOffers> offers = jobOfferService.getOffersForUser(user);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long parseLongRequired(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            throw new IllegalArgumentException(key + " is required");
        }
        try {
            return Long.valueOf(value.toString());
        } catch (Exception ex) {
            throw new IllegalArgumentException(key + " must be a number");
        }
    }

    private BigDecimal parseBigDecimalRequired(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            throw new IllegalArgumentException(key + " is required");
        }
        try {
            return new BigDecimal(value.toString());
        } catch (Exception ex) {
            throw new IllegalArgumentException(key + " must be a valid decimal");
        }
    }

    private String parseStringRequired(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            throw new IllegalArgumentException(key + " is required");
        }
        String str = value.toString().trim();
        if (str.isEmpty()) {
            throw new IllegalArgumentException(key + " cannot be empty");
        }
        return str;
    }

    private LocalDate parseLocalDateRequired(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            throw new IllegalArgumentException(key + " is required");
        }
        try {
            return LocalDate.parse(value.toString());
        } catch (Exception ex) {
            throw new IllegalArgumentException(key + " must be in ISO format (yyyy-MM-dd)");
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
    public ResponseEntity<?> acceptOffer(@PathVariable Long offerId, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobOffers offer = jobOfferService.getOfferById(offerId);

            // If candidate, ensure they own the offer
                if (user.getRole() != null && user.getRole().getRoleName() != null
                    && user.getRole().getRoleName().equalsIgnoreCase(Roles.CANDIDATE)) {
                if (offer.getApplication().getCandidate().getUser() == null
                        || !offer.getApplication().getCandidate().getUser().getUserId().equals(user.getUserId())) {
                    throw new RuntimeException("You are not authorized to act on this offer");
                }
            }

            JobOffers updated = jobOfferService.acceptOffer(offerId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{offerId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','CANDIDATE')")
    public ResponseEntity<?> rejectOffer(@PathVariable Long offerId,
            @RequestParam String reason,
            Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            JobOffers offer = jobOfferService.getOfferById(offerId);

            // If candidate, ensure they own the offer
                if (user.getRole() != null && user.getRole().getRoleName() != null
                    && user.getRole().getRoleName().equalsIgnoreCase(Roles.CANDIDATE)) {
                if (offer.getApplication().getCandidate().getUser() == null
                        || !offer.getApplication().getCandidate().getUser().getUserId().equals(user.getUserId())) {
                    throw new RuntimeException("You are not authorized to act on this offer");
                }
            }

            JobOffers updated = jobOfferService.rejectOffer(offerId, reason);
            return ResponseEntity.ok(updated);
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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','CANDIDATE','VIEWER')")
    public ResponseEntity<?> getOffersByApplication(@PathVariable Long applicationId) {
        try {
            List<JobOffers> offers = jobOfferService.getOffersByApplication(applicationId);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{offerId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','HR','RECRUITER','CANDIDATE','VIEWER')")
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
                offers = jobOfferService.getAllOffers();
            }

            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
