package com.project.platform.dto.response;

/**
 * Task contribution breakdown for an individual project member.
 * Owned by Member 2 - Team Collaboration.
 */
public record MemberContributionDTO(
    Long studentId,
    String studentName,
    String studentEmail,
    int assignedTasksCount,
    int completedTasksCount,
    int contributionPercentage
) {}
