package com.project.platform.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateFacultyFeedbackRequest {

    private Long taskId;

    @NotBlank(message = "Feedback text is required")
    @Size(max = 4000, message = "Feedback text cannot exceed 4000 characters")
    private String feedbackText;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;
}
