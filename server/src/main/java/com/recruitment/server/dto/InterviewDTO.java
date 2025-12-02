package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {
    private Long interviewId;
    private Long applicationId;
    private String candidateName;
    private String positionTitle;
    private Long roundId;
    private String roundName;
    private String roundType;
    private String interviewMode;
    private LocalDateTime interviewDate;
    private String interviewLink;
    private String status;
    private List<PanelistDTO> panelists;
    private List<InterviewFeedbackDTO> feedbacks;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;
    private String scheduledByName;
}
