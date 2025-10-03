package com.recruitment.server.repository;

import com.recruitment.server.model.JobSkillsRequired;
import com.recruitment.server.model.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobSkillsRequiredRepository extends JpaRepository<JobSkillsRequired, Long> {

    List<JobSkillsRequired> findByPosition(JobPosition position);

    @Query("SELECT jsr FROM JobSkillsRequired jsr WHERE jsr.position.positionId = :positionId")
    List<JobSkillsRequired> findByPosition_PositionId(@Param("positionId") Long positionId);
}
