package com.project.platform.dto.response;

import com.project.platform.entity.enums.TaskStatus;

import java.time.LocalDateTime;

/**
 * Detailed response representation for a Task.
 * Owned by Member 2 - Team Collaboration.
 */
public record TaskResponse(
    Long id,
    Long projectId,
    String projectTitle,
    Long assignedTo,
    String assigneeName,
    String assigneeEmail,
    String title,
    String description,
    TaskStatus status,
    LocalDateTime dueDate,
    Integer progress,
    boolean isOverdue,
    LocalDateTime updatedAt
) {}
