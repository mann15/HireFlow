package com.recruitment.server.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_history_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateHistoryNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_application_id", nullable = false)
    private JobApplication currentApplication;

    @Column(nullable = false)
    @Builder.Default
    private Boolean viewed = false;

    @Column(nullable = false)
    private String notificationType; // "SCREENING", "INTERVIEW"

    @Column(nullable = false)
    private String notificationMessage;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewed_by")
    private User viewedBy;

    private LocalDateTime viewedAt;
}