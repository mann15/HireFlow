package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionReviewerDTO {
    private Long id;
    private Long positionId;
    private String positionTitle;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerEmail;
    private Long assignedById;
    private String assignedByName;
    private String assignedAt;
}