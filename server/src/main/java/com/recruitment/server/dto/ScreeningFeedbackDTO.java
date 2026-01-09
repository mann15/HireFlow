package com.recruitment.server.dto;

import com.recruitment.server.model.ScreeningFeedback.Recommendation;
import jakarta.validation.constraints.NotNull;
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
    @NotNull(message = "applicationId is required")
    private Long applicationId;
    @NotNull(message = "reviewerId is required")
    private Long reviewerId;
    private String reviewerName;
    private String comments;
    private BigDecimal score;
    @NotNull(message = "recommendation is required")
    private Recommendation recommendation;
    private String reviewedAt;
    private List<CandidateSkillDTO> verifiedSkills;
    private List<ScreeningCommentDTO> screeningComments;
}