package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateInterview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateInterviewRepository extends JpaRepository<CandidateInterview, Long> {
}
