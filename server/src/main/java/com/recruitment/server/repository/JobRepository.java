package com.recruitment.server.repository;

import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<JobPosition, Long> {

   List<JobPosition> findByStatus(JobPosition.Status status);

   List<JobPosition> findByDepartment(String department);
   
   List<JobPosition> findByCreatedBy(User createdBy);
   
   List<JobPosition> findByStatusIn(List<JobPosition.Status> statuses);
}
