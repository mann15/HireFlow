package com.recruitment.server.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "job_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOffers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(precision = 10, scale = 2)
    private BigDecimal salaryOffered;

    @Column(length = 100)
    private String offeredDesignation;

    @Column
    private LocalDate joiningDate;

    @Column(nullable = false)
    private String offerLetterUrl;

    public enum OfferStatus {
        GENERATED,
      SEND,
      ACCEPTED,
      REJECTED,
      WITHDRAWN,
      EXPIRED
    }
    
    @Column(nullable = false)
    @Builder.Default
    private OfferStatus status= OfferStatus.GENERATED;

    @Column(nullable = false)
    private LocalDate offerValidTill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;


    private String rejectionReason;

    @Column(nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(nullable = false)
    private java.time.LocalDateTime updatedAt;
    
}
