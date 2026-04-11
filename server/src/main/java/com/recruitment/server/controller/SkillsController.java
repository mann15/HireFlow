package com.recruitment.server.controller;

import com.recruitment.server.model.Skills;
import com.recruitment.server.service.SkillsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

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
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR','CANDIDATE')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Skills.class), examples = @ExampleObject(name = "CreateSkill", value = "{\"skillName\":\"Spring Boot\",\"category\":\"Backend\"}")))
    public ResponseEntity<?> createSkill(@RequestBody Skills skill) {
        try {
            if (skill.getSkillName() == null || skill.getSkillName().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Skill name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Skills created = skillsService.createSkill(skill);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String message = e.getMessage();
            if (message != null && message.contains("unique")) {
                error.put("error", "A skill with this name already exists");
            } else {
                error.put("error", "Failed to create skill: " + message);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{skillId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER','HR')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Skills.class), examples = @ExampleObject(name = "UpdateSkill", value = "{\"skillName\":\"Spring Boot\",\"category\":\"Backend\"}")))
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
