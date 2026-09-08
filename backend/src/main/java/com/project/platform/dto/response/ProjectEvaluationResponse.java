package com.project.platform.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectEvaluationResponse {
    private Long id;
    private Long projectId;
    private Long evaluatorId;
    private String evaluatorName;
    private String evaluatorEmail;
    private Double technicalScore;
    private InnovationScoreDetails scores;
    private Double totalScore;
    private String grade;
    private String remarks;
    private LocalDateTime evaluatedAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class InnovationScoreDetails {
        private Double technical;
        private Double innovation;
        private Double execution;
        private Double presentation;
    }
}
