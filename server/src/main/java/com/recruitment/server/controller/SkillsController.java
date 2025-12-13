package com.recruitment.server.controller;

import com.recruitment.server.model.Skills;
import com.recruitment.server.service.SkillsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillsController {
    @Autowired
    private SkillsService skillsService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public List<Skills> getAllSkills() {
        return skillsService.getAllSkills();
    }

    @GetMapping("/{skillId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Skills> getSkillById(@PathVariable Long skillId) {
        Skills skill = skillsService.getSkillById(skillId);
        if (skill != null) {
            return ResponseEntity.ok(skill);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public Skills createSkill(@RequestBody Skills skill) {
        return skillsService.createSkill(skill);
    }

    @PutMapping("/{skillId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<Skills> updateSkill(@PathVariable Long skillId, @RequestBody Skills skill) {
        Skills updated = skillsService.updateSkill(skillId, skill);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{skillId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long skillId) {
        boolean deleted = skillsService.deleteSkill(skillId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/categories")
    @PreAuthorize("permitAll()")
    public List<String> getSkillCategories() {
        return skillsService.getSkillCategories();
    }
}
