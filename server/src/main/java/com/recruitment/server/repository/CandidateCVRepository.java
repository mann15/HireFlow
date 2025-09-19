package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateCV;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateCVRepository extends JpaRepository<CandidateCV, Long> {
}
