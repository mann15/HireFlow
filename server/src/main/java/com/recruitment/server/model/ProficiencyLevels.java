package com.recruitment.server.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proficiency_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProficiencyLevels {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long levelId;

    @Column(unique = true, nullable = false, length = 50)
    private String levelName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Integer rank;
}
