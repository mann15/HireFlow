package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationId;
    private Long recipientId;
    private String recipientName;
    private String message;
    private String type;
    private String category;
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
