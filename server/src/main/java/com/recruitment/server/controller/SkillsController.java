package com.recruitment.server.controller;

import com.recruitment.server.model.Skills;
import com.recruitment.server.service.SkillsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillsController {
    @Autowired
    private SkillsService skillsService;

    @GetMapping
    public List<Skills> getAllSkills() {
        return skillsService.getAllSkills();
    }

    @GetMapping("/{skillId}")
    public ResponseEntity<Skills> getSkillById(@PathVariable Long skillId) {
        Skills skill = skillsService.getSkillById(skillId);
        if (skill != null) {
            return ResponseEntity.ok(skill);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Skills createSkill(@RequestBody Skills skill) {
        return skillsService.createSkill(skill);
    }

    @PutMapping("/{skillId}")
    public ResponseEntity<Skills> updateSkill(@PathVariable Long skillId, @RequestBody Skills skill) {
        Skills updated = skillsService.updateSkill(skillId, skill);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long skillId) {
        boolean deleted = skillsService.deleteSkill(skillId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/categories")
    public List<String> getSkillCategories() {
        return skillsService.getSkillCategories();
    }
}
