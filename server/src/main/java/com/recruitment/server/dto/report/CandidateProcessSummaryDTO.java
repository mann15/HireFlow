package com.recruitment.server.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CandidateProcessSummaryDTO {
    private long totalApplications;
    private long appliedCount;
    private long screeningCount;
    private long interviewCount;
    private long selectedCount;
    private long rejectedCount;
    private long onHoldCount;
    private long withdrawnCount;
}
