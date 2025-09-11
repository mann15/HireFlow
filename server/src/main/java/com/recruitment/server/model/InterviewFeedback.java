package com.recruitment.server.model;

import lombok.*;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private CandidateInterview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panelist_id", nullable = false)
    private User panelist;

    @Column(length = 2000)
    private String feedback_comments;

    @Column(precision = 3, scale = 2)
    private BigDecimal overall_rating;

    @Column(precision = 3, scale = 2)
    private BigDecimal communication_skills;

    @Column(precision = 3, scale = 2)
    private BigDecimal technical_knowledge;

    @Column(precision = 3, scale = 2)
    private BigDecimal cultural_fit_rating;

    public enum Recommendation {
        STRONG_HIRE,
        HIRE,
        HOLD,
        NO_HIRE,
        STRONG_NO_HIRE
    }

    @Builder.Default
    @Column(nullable = false)
    private Recommendation recommendation = Recommendation.HOLD;

    @Column(nullable = false)
    private String strengths;

    @Column(nullable = false)
    private String areas_of_improvement;

}
