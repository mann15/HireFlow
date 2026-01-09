package com.recruitment.server.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CollegeReportDTO {
    private String collegeName;
    private long candidateCount;
    private long applicationCount;
}
