package com.recruitment.server.repository;

import com.recruitment.server.model.Locations;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationsRepository extends JpaRepository<Locations, Long> {
    Locations findByCity(String city);
}
