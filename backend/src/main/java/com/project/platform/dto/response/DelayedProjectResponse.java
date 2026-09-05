package com.project.platform.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record DelayedProjectResponse(
    Long projectId,
    String projectTitle,
    boolean delayed,
    boolean inactive,
    int delayedTaskCount,
    LocalDateTime lastActivityAt,
    List<Long> delayedTaskIds
) {}
