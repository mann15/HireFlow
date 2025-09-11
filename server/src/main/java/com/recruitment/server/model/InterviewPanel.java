package com.recruitment.server.model;

import lombok.*;
import jakarta.persistence.*;


@Entity
@Table(name = "interview_panels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewPanel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private CandidateInterview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panelist_id", nullable = false)
    private User panelist;
    
}
