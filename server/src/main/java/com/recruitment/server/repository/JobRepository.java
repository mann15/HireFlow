package com.recruitment.server.repository;

import com.recruitment.server.model.JobPosition;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<JobPosition, Long> {

   Optional<JobPosition> findByStatus(String status);

   Optional<JobPosition> findByDepartment(String department);
}
