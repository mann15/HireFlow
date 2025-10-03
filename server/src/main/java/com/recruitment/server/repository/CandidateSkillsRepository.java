package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateSkills;
import com.recruitment.server.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateSkillsRepository extends JpaRepository<CandidateSkills, Long> {

    List<CandidateSkills> findByCandidate(Candidate candidate);

    @Query("SELECT cs FROM CandidateSkills cs WHERE cs.candidate.candidateId = :candidateId")
    List<CandidateSkills> findByCandidate_CandidateId(@Param("candidateId") Long candidateId);

    @Query("SELECT cs FROM CandidateSkills cs WHERE cs.skill.skillId = :skillId")
    List<CandidateSkills> findBySkill_SkillId(@Param("skillId") Long skillId);
}
