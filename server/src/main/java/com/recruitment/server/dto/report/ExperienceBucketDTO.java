package com.recruitment.server.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExperienceBucketDTO {
    private String bucketLabel;
    private long candidateCount;
}
