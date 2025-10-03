package com.recruitment.server.model;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate_interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class CandidateInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private InterviewRound round;

    public enum InterviewMode {
        IN_PERSON,
        PHONE,
        ONLINE,
        HYBRID
    }

    @Column(nullable = false)
    @Builder.Default
    private InterviewMode interviewMode = InterviewMode.IN_PERSON;

    @Column(length = 500)
    private String interviewLink;

    @Column(nullable = false)
    private LocalDateTime interviewDate;

    public enum InterviewStatus {
        SCHEDULED,
        COMPLETED,
        CANCELED,
        RESCHEDULED,
        NO_SHOW
    }

    @Column(nullable = false)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_by", nullable = false)
    private User user;

}
