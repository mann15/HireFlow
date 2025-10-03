package com.recruitment.server.repository;

import com.recruitment.server.model.JobApplication;
import com.recruitment.server.model.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    @Query("SELECT ja FROM JobApplication ja LEFT JOIN FETCH ja.candidate LEFT JOIN FETCH ja.position WHERE ja.position.positionId = :positionId")
    List<JobApplication> findByPositionId(@Param("positionId") Long positionId);

    List<JobApplication> findByPosition(JobPosition position);
}
