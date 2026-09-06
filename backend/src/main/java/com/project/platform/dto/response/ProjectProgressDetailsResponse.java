package com.project.platform.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed progress tracking response for a project.
 * Owned by Member 2 - Team Collaboration.
 */
public record ProjectProgressDetailsResponse(
    Long projectId,
    String projectTitle,
    Integer overallProgress,
    int totalTasks,
    int completedTasks,
    int inProgressTasks,
    int todoTasks,
    int delayedTasks,
    LocalDateTime lastActivityAt,
    String healthStatus,
    List<MemberContributionDTO> memberContributions,
    LocalDateTime updatedAt
) {}
