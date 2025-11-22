package com.recruitment.server.repository;

import com.recruitment.server.model.InterviewRound;
import com.recruitment.server.model.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRoundRepository extends JpaRepository<InterviewRound, Long> {
    List<InterviewRound> findByPosition(JobPosition position);
    
    List<InterviewRound> findByPositionOrderByRoundOrder(JobPosition position);
    
    List<InterviewRound> findByPositionAndIsActiveTrue(JobPosition position);
}
