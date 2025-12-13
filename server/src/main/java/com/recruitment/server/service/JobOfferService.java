package com.recruitment.server.service;

import com.recruitment.server.model.*;
import com.recruitment.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobOfferService {

    private final JobOffersRepository jobOffersRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public JobOffers generateOffer(Long applicationId, BigDecimal salaryOffered,
            String offeredDesignation, LocalDate joiningDate, 
            LocalDate offerValidTill, User createdBy) {
        
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Validate that candidate is in appropriate status
        if (application.getStatus() != JobApplication.Status.SELECTED) {
            throw new RuntimeException("Can only generate offer for selected candidates");
        }

        // Generate offer letter URL (placeholder - in real system, generate PDF)
        String offerLetterUrl = "offers/" + applicationId + "/offer-letter.pdf";

        JobOffers offer = JobOffers.builder()
                .application(application)
                .salaryOffered(salaryOffered)
                .offeredDesignation(offeredDesignation)
                .joiningDate(joiningDate)
                .offerLetterUrl(offerLetterUrl)
                .status(JobOffers.OfferStatus.GENERATED)
                .offerValidTill(offerValidTill)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        JobOffers savedOffer = jobOffersRepository.save(offer);

        // Update application current stage
        application.setCurrentStage("OFFER_GENERATED");
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);

        return savedOffer;
    }

    public JobOffers sendOffer(Long offerId) {
        JobOffers offer = jobOffersRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getStatus() != JobOffers.OfferStatus.GENERATED) {
            throw new RuntimeException("Offer must be in GENERATED status to send");
        }

        offer.setStatus(JobOffers.OfferStatus.SEND);
        offer.setUpdatedAt(LocalDateTime.now());

        JobOffers updated = jobOffersRepository.save(offer);

        // Send notification (email would be sent here in real system)
        // For now, just update status

        return updated;
    }

    public JobOffers acceptOffer(Long offerId) {
        JobOffers offer = jobOffersRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getStatus() != JobOffers.OfferStatus.SEND) {
            throw new RuntimeException("Offer must be sent before it can be accepted");
        }

        offer.setStatus(JobOffers.OfferStatus.ACCEPTED);
        offer.setUpdatedAt(LocalDateTime.now());

        JobOffers updated = jobOffersRepository.save(offer);

        // Update application
        JobApplication application = offer.getApplication();
        application.setCurrentStage("OFFER_ACCEPTED");
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);

        // Notify HR and recruiters
        if (application.getPosition().getCreatedBy() != null) {
            notificationService.createNotification(
                application.getPosition().getCreatedBy(),
                "Offer accepted by " + application.getCandidate().getFirstName() + 
                " " + application.getCandidate().getLastName(),
                Notification.NotificationType.SUCCESS,
                Notification.NotificationCategory.OFFER_GENERATED,
                offerId
            );
        }

        return updated;
    }

    public JobOffers rejectOffer(Long offerId, String rejectionReason) {
        JobOffers offer = jobOffersRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        offer.setStatus(JobOffers.OfferStatus.REJECTED);
        offer.setRejectionReason(rejectionReason);
        offer.setUpdatedAt(LocalDateTime.now());

        JobOffers updated = jobOffersRepository.save(offer);

        // Update application
        JobApplication application = offer.getApplication();
        application.setStatus(JobApplication.Status.REJECTED);
        application.setRejectionReason("Offer rejected: " + rejectionReason);
        application.setStatusUpdatedAt(LocalDateTime.now());
        jobApplicationRepository.save(application);

        return updated;
    }

    public JobOffers withdrawOffer(Long offerId) {
        JobOffers offer = jobOffersRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        offer.setStatus(JobOffers.OfferStatus.WITHDRAWN);
        offer.setUpdatedAt(LocalDateTime.now());

        return jobOffersRepository.save(offer);
    }

    public List<JobOffers> getOffersByApplication(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return jobOffersRepository.findByApplication(application);
    }

    public JobOffers getOfferById(Long offerId) {
        return jobOffersRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
    }

    public List<JobOffers> getOffersByStatus(JobOffers.OfferStatus status) {
        return jobOffersRepository.findByStatus(status);
    }
}
