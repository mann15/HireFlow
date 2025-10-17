package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningCommentDTO {
    private Long commentId;
    private Long applicationId;
    private Long userId;
    private String userName;
    private String userRole;
    private String comment;
    private String createdAt;
}