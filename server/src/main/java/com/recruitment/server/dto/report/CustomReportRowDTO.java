package com.recruitment.server.dto.report;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.recruitment.server.model.JobApplication;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomReportRowDTO {
    private Long applicationId;
    private String candidateName;
    private String email;
    private String positionTitle;
    private JobApplication.Status status;
    private LocalDateTime appliedAt;
    private BigDecimal totalExperience;
    private String collegeName;
}
