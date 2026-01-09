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

        List<JobApplication> findByCandidateAndPosition(Candidate candidate, JobPosition position);

        List<JobApplication> findByPositionPositionId(Long positionId);

        List<JobApplication> findByStatus(Status status);

        @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.candidate.candidateId = :candidateId AND ja.status IN ('SCREENING', 'INTERVIEW', 'SELECTED', 'REJECTED', 'ON_HOLD')")
        int countPreviousApplicationsByCandidate(@Param("candidateId") Long candidateId);

        @Query("SELECT ja FROM JobApplication ja WHERE ja.candidate.candidateId = :candidateId AND ja.applicationId <> :currentApplicationId")
        List<JobApplication> findOtherApplicationsByCandidate(@Param("candidateId") Long candidateId,
                        @Param("currentApplicationId") Long currentApplicationId);

        @Query("""
                        SELECT ja FROM JobApplication ja
                        JOIN FETCH ja.candidate c
                        JOIN FETCH ja.position p
                        WHERE (:start IS NULL OR ja.appliedAt >= :start)
                          AND (:end IS NULL OR ja.appliedAt <= :end)
                        """)
        List<JobApplication> findAllForReporting(@Param("start") java.time.LocalDateTime start,
                        @Param("end") java.time.LocalDateTime end);

        // Role-based filtering queries
        // For REVIEWER: Get applications for positions where the reviewer is assigned
        @Query("""
                SELECT DISTINCT ja FROM JobApplication ja
                WHERE ja.position.positionId IN (
                    SELECT pr.position.positionId FROM PositionReviewer pr 
                    WHERE pr.reviewer.userId = :reviewerId
                )
                """)
        List<JobApplication> findByReviewerId(@Param("reviewerId") Long reviewerId);

        // For INTERVIEWER: Get applications for interviews where the interviewer is a panelist
        @Query("""
                SELECT DISTINCT ja FROM JobApplication ja
                WHERE ja.applicationId IN (
                    SELECT ci.application.applicationId FROM CandidateInterview ci
                    JOIN InterviewPanel ip ON ip.interview.interviewId = ci.interviewId
                    WHERE ip.panelist.userId = :interviewerId
                )
                """)
        List<JobApplication> findByInterviewerId(@Param("interviewerId") Long interviewerId);

        // For RECRUITER: Get applications for positions created by the recruiter
        @Query("""
                SELECT ja FROM JobApplication ja
                WHERE ja.position.createdBy.userId = :recruiterId
                """)
        List<JobApplication> findByRecruiterId(@Param("recruiterId") Long recruiterId);
}
