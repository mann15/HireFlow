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
    @JoinColumn(name = "position_id", nullable = true)
    private JobPosition positionId;

    /**
     * Original storage path or Cloudinary URL depending on configuration.
     */
    @Column(nullable = false)
    private String cvFilePath;

    /** Cloudinary public id (if uploaded to Cloudinary) */
    private String cloudPublicId;

    /** Cloudinary secure URL */
    private String cloudUrl;

    /** Extracted structured/profile data (JSON string) */
    @Column(columnDefinition = "TEXT")
    private String extractedData;

}
