package com.recruitment.server.model;


import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long candidateId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String phone;
    private String alternatePhone;
    private String currentLocation;
    private String preferredLocation;

    @Builder.Default
    private BigDecimal totalExperience = BigDecimal.ZERO;

    private BigDecimal currentSalary;
    private BigDecimal expectedSalary;
    private Integer noticePeriod;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Source source = Source.OTHER;

    private String sourceDetails;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Source {
        JOB_PORTAL, REFERRAL, WALK_IN, CAMPUS, SOCIAL_MEDIA, COMPANY_WEBSITE, OTHER
    }
}
