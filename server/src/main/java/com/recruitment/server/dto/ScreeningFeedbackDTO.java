package com.recruitment.server.dto;

import com.recruitment.server.model.ScreeningFeedback.Recommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningFeedbackDTO {
    private Long feedbackId;
    private Long applicationId;
    private Long reviewerId;
    private String reviewerName;
    private String comments;
    private BigDecimal score;
    private Recommendation recommendation;
    private String reviewedAt;
    private List<CandidateSkillDTO> verifiedSkills;
    private List<ScreeningCommentDTO> screeningComments;
}