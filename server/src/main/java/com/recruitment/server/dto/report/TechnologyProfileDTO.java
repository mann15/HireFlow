package com.recruitment.server.dto.report;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TechnologyProfileDTO {
    private String skillName;
    private long candidateCount;
    private BigDecimal averageYearsOfExperience;
    private long verifiedSkillCount;
}
