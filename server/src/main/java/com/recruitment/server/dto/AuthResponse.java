package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String name;
    private String email;
    private String role;
    private Long userId;
    private boolean requiresPasswordChange;
}
