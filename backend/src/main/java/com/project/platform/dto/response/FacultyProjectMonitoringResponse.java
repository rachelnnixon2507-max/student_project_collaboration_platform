package com.project.platform.dto.response;

import com.project.platform.entity.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FacultyProjectMonitoringResponse {
    private Long projectId;
    private String title;
    private String description;
    private String requiredSkills;
    private ProjectStatus status;
    private Long createdBy;
    private String creatorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Progress metrics
    private Integer overallProgress;
    private LocalDateTime lastActivityAt;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int todoTasks;

    // Associated details
    private List<MemberSummary> members;
    private List<TaskSummary> tasks;
    private ProjectEvaluationResponse latestEvaluation;
    private ProjectApprovalResponse latestApproval;
    private List<FacultyFeedbackResponse> recentFeedback;

    @Data
    @Builder
    public static class MemberSummary {
        private Long userId;
        private String name;
        private String email;
        private String role;
        private String department;
    }

    @Data
    @Builder
    public static class TaskSummary {
        private Long taskId;
        private String title;
        private String status;
        private Integer progress;
        private Long assignedTo;
        private String assigneeName;
        private LocalDateTime dueDate;
    }
}
