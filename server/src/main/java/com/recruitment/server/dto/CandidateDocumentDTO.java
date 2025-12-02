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
public class CandidateDocumentDTO {
    private Long documentId;
    private Long applicationId;
    private String candidateName;
    private String documentTypeName;
    private String documentUrl;
    private String status;
    private String verifiedByName;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String remarks;
}
