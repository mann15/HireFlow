package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateCV;
import com.recruitment.server.model.Candidate;
import com.recruitment.server.model.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateCVRepository extends JpaRepository<CandidateCV, Long> {

    Optional<CandidateCV> findByCandidate(Candidate candidate);

    List<CandidateCV> findByPositionId(JobPosition position);

    @Query("SELECT cv FROM CandidateCV cv WHERE cv.candidate.candidateId = :candidateId")
    List<CandidateCV> findByCandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT cv FROM CandidateCV cv WHERE cv.positionId.positionId = :positionId")
    List<CandidateCV> findByPositionId(@Param("positionId") Long positionId);
}
