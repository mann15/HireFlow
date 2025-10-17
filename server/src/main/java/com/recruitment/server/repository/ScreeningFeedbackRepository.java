package com.recruitment.server.repository;

import com.recruitment.server.model.Candidate;
import com.recruitment.server.model.ScreeningFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScreeningFeedbackRepository extends JpaRepository<ScreeningFeedback, Long> {
    List<ScreeningFeedback> findByApplicationApplicationId(Long applicationId);

    Optional<ScreeningFeedback> findTopByApplicationApplicationIdOrderByReviewedAtDesc(Long applicationId);

    @Query("SELECT sf FROM ScreeningFeedback sf WHERE sf.application.candidate.candidateId = :candidateId AND sf.application.applicationId != :currentApplicationId")
    List<ScreeningFeedback> findPreviousScreeningsByCandidate(@Param("candidateId") Long candidateId,
            @Param("currentApplicationId") Long currentApplicationId);

    boolean existsByApplicationCandidate(Candidate candidate);

    @Query("SELECT COUNT(sf) > 0 FROM ScreeningFeedback sf WHERE sf.application.candidate = :candidate AND sf.application.position.positionId != :positionId")
    boolean existsPreviousScreeningsForOtherPositions(@Param("candidate") Candidate candidate,
            @Param("positionId") Long positionId);
}
