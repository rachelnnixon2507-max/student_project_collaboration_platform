package com.project.platform.dto.response;

import java.time.LocalDateTime;

public record PlatformAnalyticsResponse(
    Long totalUsers,
    Long totalStudents,
    Long totalFaculty,
    Long totalProjects,
    Long openProjects,
    Long inProgressProjects,
    Long completedProjects,
    Long totalTasks,
    Long completedTasks,
    Long delayedProjects,
    Long inactiveProjects,
    LocalDateTime generatedAt
) {}
