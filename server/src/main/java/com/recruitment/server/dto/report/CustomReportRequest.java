package com.recruitment.server.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.recruitment.server.model.JobApplication;

import lombok.Data;

@Data
public class CustomReportRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> positionIds;
    private List<JobApplication.Status> statuses;
    private List<String> skills;
    private List<String> colleges;
    private BigDecimal minExperience;
    private BigDecimal maxExperience;
}
