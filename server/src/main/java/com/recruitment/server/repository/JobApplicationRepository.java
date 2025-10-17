package com.recruitment.server.repository;

import com.recruitment.server.model.Candidate;
import com.recruitment.server.model.JobApplication;
import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.JobApplication.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    @Query("SELECT ja FROM JobApplication ja LEFT JOIN FETCH ja.candidate LEFT JOIN FETCH ja.position WHERE ja.position.positionId = :positionId")
    List<JobApplication> findByPositionId(@Param("positionId") Long positionId);

    @Query("SELECT ja FROM JobApplication ja LEFT JOIN FETCH ja.candidate LEFT JOIN FETCH ja.position WHERE ja.position.positionId = :positionId AND ja.status = :status")
    List<JobApplication> findByPositionIdAndStatus(@Param("positionId") Long positionId,
            @Param("status") Status status);

    @Query("SELECT ja FROM JobApplication ja LEFT JOIN FETCH ja.candidate LEFT JOIN FETCH ja.position WHERE ja.position.positionId = :positionId AND ja.currentStage = :stage")
    List<JobApplication> findByPositionIdAndCurrentStage(@Param("positionId") Long positionId,
            @Param("stage") String stage);

    List<JobApplication> findByPosition(JobPosition position);

    List<JobApplication> findByCandidate(Candidate candidate);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.candidate.candidateId = :candidateId AND ja.status IN ('SCREENING', 'INTERVIEW', 'SELECTED', 'REJECTED', 'ON_HOLD')")
    int countPreviousApplicationsByCandidate(@Param("candidateId") Long candidateId);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.candidate.candidateId = :candidateId AND ja.applicationId <> :currentApplicationId")
    List<JobApplication> findOtherApplicationsByCandidate(@Param("candidateId") Long candidateId,
            @Param("currentApplicationId") Long currentApplicationId);
}
