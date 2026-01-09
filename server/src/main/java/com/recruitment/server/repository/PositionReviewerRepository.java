package com.recruitment.server.repository;

import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.PositionReviewer;
import com.recruitment.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PositionReviewerRepository extends JpaRepository<PositionReviewer, Long> {
    List<PositionReviewer> findByPositionPositionId(Long positionId);

    List<PositionReviewer> findByReviewerUserId(Long reviewerId);

    Optional<PositionReviewer> findByPositionPositionIdAndReviewerUserId(Long positionId, Long reviewerId);

    long deleteByPositionPositionIdAndReviewerUserId(Long positionId, Long reviewerId);

    boolean existsByPositionAndReviewer(JobPosition position, User reviewer);

    void deleteByPositionAndReviewer(JobPosition position, User reviewer);
}
