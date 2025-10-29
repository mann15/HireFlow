package com.recruitment.server.repository;

import com.recruitment.server.model.Skills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SkillsRepository extends JpaRepository<Skills, Long> {
    @Query("SELECT DISTINCT s.category FROM Skills s WHERE s.category IS NOT NULL")
    List<String> findDistinctCategories();

    Skills findBySkillNameIgnoreCase(String skillName);
}
