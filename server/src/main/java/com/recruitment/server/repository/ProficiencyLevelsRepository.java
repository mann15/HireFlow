package com.recruitment.server.repository;

import com.recruitment.server.model.ProficiencyLevels;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProficiencyLevelsRepository extends JpaRepository<ProficiencyLevels, Long> {
    ProficiencyLevels findByLevelName(String levelName);
}
