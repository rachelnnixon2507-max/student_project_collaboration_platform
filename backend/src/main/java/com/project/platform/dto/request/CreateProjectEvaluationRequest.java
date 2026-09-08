package com.project.platform.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProjectEvaluationRequest {

    @NotNull(message = "Technical score is required")
    @DecimalMin(value = "0.0", message = "Technical score cannot be negative")
    @DecimalMax(value = "100.0", message = "Technical score cannot exceed 100")
    private Double technicalScore;

    @NotNull(message = "Innovation score is required")
    @DecimalMin(value = "0.0", message = "Innovation score cannot be negative")
    @DecimalMax(value = "100.0", message = "Innovation score cannot exceed 100")
    private Double innovationScore;

    @NotNull(message = "Execution score is required")
    @DecimalMin(value = "0.0", message = "Execution score cannot be negative")
    @DecimalMax(value = "100.0", message = "Execution score cannot exceed 100")
    private Double executionScore;

    @NotNull(message = "Presentation score is required")
    @DecimalMin(value = "0.0", message = "Presentation score cannot be negative")
    @DecimalMax(value = "100.0", message = "Presentation score cannot exceed 100")
    private Double presentationScore;

    @Size(max = 4000, message = "Remarks cannot exceed 4000 characters")
    private String remarks;
}
