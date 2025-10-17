package com.recruitment.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateHistoryNotificationDTO {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long applicationId;
    private String notificationType;
    private String notificationMessage;
    private Boolean viewed;
    private String createdAt;
    private Long viewedById;
    private String viewedByName;
    private String viewedAt;
}