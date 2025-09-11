package com.recruitment.server.model;

import lombok.*;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_skill_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSkillAssesment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", nullable = false)
    private InterviewFeedback feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skills skill;

    @Column(precision = 3, scale = 2, nullable = false)
    private BigDecimal rating;

    @Column(length = 1000)
    private String comments;

}
