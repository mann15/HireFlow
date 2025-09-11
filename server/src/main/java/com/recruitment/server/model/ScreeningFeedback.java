package com.recruitment.server.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "screening_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScreeningFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(nullable = false, length = 1000)
    private String comments;

    @Column(nullable = false)
    private BigDecimal score;

    public enum Recommendation {
        HOLD,
        SHORTLIST,
        REJECT
    }

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Recommendation recommendation = Recommendation.HOLD;

    @Column(nullable = false)
    private LocalDateTime reviewedAt;

}
