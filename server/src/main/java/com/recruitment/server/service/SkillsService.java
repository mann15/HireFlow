package com.recruitment.server.service;

import com.recruitment.server.model.Skills;
import com.recruitment.server.repository.SkillsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillsService {
    @Autowired
    private SkillsRepository skillsRepository;

    public List<Skills> getAllSkills() {
        return skillsRepository.findAll();
    }

    public Skills getSkillById(Long skillId) {
        Optional<Skills> skill = skillsRepository.findById(skillId);
        return skill.orElse(null);
    }

    public Skills createSkill(Skills skill) {
        return skillsRepository.save(skill);
    }

    public Skills updateSkill(Long skillId, Skills skill) {
        if (skillsRepository.existsById(skillId)) {
            skill.setSkillId(skillId);
            return skillsRepository.save(skill);
        }
        return null;
    }

    public boolean deleteSkill(Long skillId) {
        if (skillsRepository.existsById(skillId)) {
            skillsRepository.deleteById(skillId);
            return true;
        }
        return false;
    }

    public List<String> getSkillCategories() {
        return skillsRepository.findDistinctCategories();
    }
}
