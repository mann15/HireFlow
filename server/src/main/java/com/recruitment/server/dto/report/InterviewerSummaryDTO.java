package com.recruitment.server.dto.report;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InterviewerSummaryDTO {
    private Long userId;
    private String name;
    private long interviewsAssigned;
    private long completed;
    private long noShows;
    private BigDecimal averageRating;
}
