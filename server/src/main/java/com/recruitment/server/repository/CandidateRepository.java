package com.recruitment.server.repository;

import com.recruitment.server.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByEmail(String email);

    List<Candidate> findByIsActiveTrue();

    List<Candidate> findByCurrentLocationContainingIgnoreCase(String location);

    List<Candidate> findByPreferredLocationContainingIgnoreCase(String location);

    @Query("SELECT c FROM Candidate c WHERE c.totalExperience >= :minExp AND c.totalExperience <= :maxExp")
    List<Candidate> findByExperienceRange(@Param("minExp") java.math.BigDecimal minExp,
            @Param("maxExp") java.math.BigDecimal maxExp);

    @Query("SELECT c FROM Candidate c WHERE c.expectedSalary <= :maxSalary")
    List<Candidate> findByExpectedSalaryLessThanEqual(@Param("maxSalary") java.math.BigDecimal maxSalary);

    @Query("SELECT DISTINCT c FROM Candidate c JOIN c.candidateSkills cs WHERE cs.skill.skillName IN :skillNames")
    List<Candidate> findBySkillsIn(@Param("skillNames") List<String> skillNames);

    @Query("SELECT c FROM Candidate c WHERE c.firstName LIKE %:name% OR c.lastName LIKE %:name%")
    List<Candidate> findByNameContaining(@Param("name") String name);
}
