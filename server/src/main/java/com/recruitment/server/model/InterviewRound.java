package com.recruitment.server.model;

import lombok.*;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "interview_rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Candidate candidate;

    @Column(nullable = false)
    private String roundName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundType roundType;

    @Column(nullable = false)
    private Integer roundOrder;

    @Builder.Default
    private Boolean isMandatory = true;

    @Builder.Default
    private Integer durationMinutes = 60;

    private String description;

    @Builder.Default
    private Boolean isActive = true;

    public enum RoundType {
        TECHNICAL, HR, MANAGERIAL, PANEL, GROUP_DISCUSSION, PRESENTATION, OTHER
    }
}
