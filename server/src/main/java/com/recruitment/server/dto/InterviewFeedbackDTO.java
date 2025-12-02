package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackDTO {
    private Long feedbackId;
    private Long interviewId;
    private Long panelistId;
    private String panelistName;
    private String feedbackComments;
    private BigDecimal overallRating;
    private BigDecimal communicationSkills;
    private BigDecimal technicalKnowledge;
    private BigDecimal culturalFitRating;
    private String recommendation;
    private String strengths;
    private String areasOfImprovement;
}
