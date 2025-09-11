package com.recruitment.server.model;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_skills_required")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSkillsRequired {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition position;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skills skill;

    @ManyToOne
    @JoinColumn(name = "proficiency_level_id", nullable = false)
    private ProficiencyLevels proficiencyLevel;

    @Column(nullable = false)
    private boolean isMandatory;

    @Column(nullable = false)
    private BigDecimal weightage;

}