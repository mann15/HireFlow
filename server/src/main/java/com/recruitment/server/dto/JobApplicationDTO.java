package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private Long applicationId;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long positionId;
    private String positionTitle;
    private String status;
    private String currentStage;
    private BigDecimal overallScore;
    private LocalDateTime appliedAt;
    private LocalDateTime statusUpdatedAt;
    private String statusUpdatedByName;
    private String holdReason;
    private String rejectionReason;
    private String notes;
    private Boolean hasHistory;
}
