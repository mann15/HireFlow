package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanelistDTO {
    private Long panelistId;
    private String name;
    private String email;
    private String role;
}
