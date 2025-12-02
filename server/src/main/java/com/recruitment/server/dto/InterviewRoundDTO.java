package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRoundDTO {
    private Long roundId;
    private Long positionId;
    private String roundName;
    private String roundType;
    private Integer roundOrder;
    private Boolean isMandatory;
    private Integer durationMinutes;
    private String description;
    private Boolean isActive;
}
