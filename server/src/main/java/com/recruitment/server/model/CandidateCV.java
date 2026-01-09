package com.recruitment.server.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_cvs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class CandidateCV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cvId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnoreProperties("cvs")
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = true)
    @JsonIgnoreProperties("applications")
    private JobPosition positionId;

    /**
     * Original storage path or Cloudinary URL depending on configuration.
     */
    @Column(nullable = false)
    private String cvFilePath;

    /** Original file name */
    private String fileName;

    /** Cloudinary public id (if uploaded to Cloudinary) */
    private String cloudPublicId;

    /** Cloudinary secure URL */
    private String cloudUrl;

    /** Extracted structured/profile data (JSON string) */
    @Column(columnDefinition = "TEXT")
    private String extractedData;

    /** Upload timestamp */
    private LocalDateTime uploadedAt;

}
