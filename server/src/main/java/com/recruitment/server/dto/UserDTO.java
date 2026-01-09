package com.recruitment.server.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Long roleId;
    private String roleName;
    private Boolean isActive;
    private Boolean requiresPasswordChange;
}
