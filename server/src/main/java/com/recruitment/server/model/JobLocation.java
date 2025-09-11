package com.recruitment.server.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "job_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobLocationId;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Locations location;

    @ManyToOne
    @JoinColumn(name = "position_id", nullable = false)
    private JobPosition position;


}
