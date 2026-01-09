package com.recruitment.server.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPositionDTO {
    private Long positionId;
    private String jobTitle;
    private String jobDescription;
    private String department;
    private String employmentType;
    private Integer experienceRequiredMin;
    private Integer experienceRequiredMax;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private Integer totalPositions;
    private Integer filledPositions;
    private String status;
    private String closureReason;
    private Long selectedCandidateId;
    private Long createdBy;
    private String createdAt;
    private String updatedAt;
    private List<Long> requiredSkillIds;
    private List<Long> reviewerIds;
    private String interviewRoundsConfig; // JSON config
}
