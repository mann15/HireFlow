package com.recruitment.server.model;


import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long positionId;

    @Column(nullable = false)
    private String jobTitle;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String jobDescription;

    private String department;

    @Enumerated(EnumType.STRING)
    private EmploymentType employmentType;

    @Builder.Default
    private Integer experienceRequiredMin = 0;

    private Integer experienceRequiredMax;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Builder.Default
    private Integer totalPositions = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.OPEN;

    private String closureReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_candidate_id")
    private Candidate selectedCandidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime closedAt;

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    }

    public enum Status {
        OPEN, ON_HOLD, CLOSED
    }
}
