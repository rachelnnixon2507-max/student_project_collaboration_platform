package com.project.platform.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FacultyFeedbackResponse {
    private Long id;
    private Long projectId;
    private Long facultyId;
    private String facultyName;
    private String facultyEmail;
    private Long taskId;
    private String taskTitle;
    private String feedbackText;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
