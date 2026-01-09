package com.recruitment.server.dto.report;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportSummaryResponse {
    private List<PositionReportDTO> positionReports;
    private List<CollegeReportDTO> collegeReports;
    private CandidateProcessSummaryDTO candidateProcessSummary;
    private List<InterviewerSummaryDTO> interviewerSummaries;
    private List<DailySummaryDTO> dailySummaries;
    private List<TechnologyProfileDTO> technologyProfiles;
    private List<ExperienceBucketDTO> experienceBuckets;
}
