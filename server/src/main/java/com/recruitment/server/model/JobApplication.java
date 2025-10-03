package com.recruitment.server.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id")
    private CandidateCV cv;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.APPLIED;

    private String currentStage;
    private BigDecimal overallScore;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime statusUpdatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_updated_by")
    private User statusUpdatedBy;

    private String holdReason;
    private String rejectionReason;
    private String notes;

    public enum Status {
        APPLIED, SCREENING, INTERVIEW, SELECTED, REJECTED, ON_HOLD, WITHDRAWN
    }
}