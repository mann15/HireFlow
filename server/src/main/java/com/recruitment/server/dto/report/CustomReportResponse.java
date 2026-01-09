package com.recruitment.server.dto.report;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomReportResponse {
    private List<CustomReportRowDTO> rows;
    private CandidateProcessSummaryDTO summary;
}
