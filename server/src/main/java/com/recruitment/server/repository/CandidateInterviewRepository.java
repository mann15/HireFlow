package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateInterview;
import com.recruitment.server.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CandidateInterviewRepository extends JpaRepository<CandidateInterview, Long> {
    @Query("SELECT ci FROM CandidateInterview ci WHERE ci.application.candidate = :candidate")
    List<CandidateInterview> findByApplication_Candidate(@Param("candidate") Candidate candidate);

    @Query("SELECT COUNT(ci) > 0 FROM CandidateInterview ci WHERE ci.application.candidate = :candidate")
    boolean existsByApplicationCandidate(@Param("candidate") Candidate candidate);
}
