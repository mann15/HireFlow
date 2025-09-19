package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateSkills;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateSkillsRepository extends JpaRepository<CandidateSkills, Long> {
}
