package com.recruitment.server.repository;

import com.recruitment.server.model.JobLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobLocationRepository extends JpaRepository<JobLocation, Long> {
}
