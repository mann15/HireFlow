package com.recruitment.server.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDTO {
    private Long candidateId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String alternatePhone;
    private String currentLocation;
    private String preferredLocation;
    private String collegeName;
    private BigDecimal totalExperience;
    private BigDecimal currentSalary;
    private BigDecimal expectedSalary;
    private Integer noticePeriod;
    private String source;
    private String sourceDetails;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
