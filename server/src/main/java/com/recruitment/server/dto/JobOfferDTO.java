package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobOfferDTO {
    private Long offerId;
    private Long applicationId;
    private String candidateName;
    private String positionTitle;
    private BigDecimal salaryOffered;
    private String offeredDesignation;
    private LocalDate joiningDate;
    private String offerLetterUrl;
    private String status;
    private LocalDate offerValidTill;
    private String createdByName;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
