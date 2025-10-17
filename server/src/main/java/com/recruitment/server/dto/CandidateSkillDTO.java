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
public class CandidateSkillDTO {
    private Long id;
    private Long skillId;
    private String skillName;
    private Long proficiencyLevelId;
    private String proficiencyLevelName;
    private BigDecimal yearsOfExperience;
    private Boolean verified;
    private Long verifiedById;
    private String verifiedByName;
}