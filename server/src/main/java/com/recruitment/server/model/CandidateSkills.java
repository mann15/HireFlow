package com.recruitment.server.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "candidate_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkills {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skills skill;

    @ManyToOne
    @JoinColumn(name = "proficiency_level_id", nullable = false)
    private ProficiencyLevels proficiencyLevel;

    // Years of experience for the skill
    private BigDecimal yearsOfExperience;

    // Flag to indicate if skill was verified during screening
    private Boolean verified;

    // User who verified the skill (recruiter/interviewer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;
}
