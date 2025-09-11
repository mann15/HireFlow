package com.recruitment.server.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_cvs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateCV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cvId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition positionId;

    @Column(nullable = false)
    private String cvFilePath;

}
