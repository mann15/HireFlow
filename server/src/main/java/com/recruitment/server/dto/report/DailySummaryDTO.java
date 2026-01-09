package com.recruitment.server.dto.report;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DailySummaryDTO {
    private LocalDate date;
    private long totalApplications;
    private long appliedCount;
    private long screeningCount;
    private long interviewCount;
    private long selectedCount;
    private long rejectedCount;
}
