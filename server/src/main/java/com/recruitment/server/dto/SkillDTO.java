package com.recruitment.server.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDTO {
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
