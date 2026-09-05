package com.project.platform.service;

import com.project.platform.dto.response.DelayedProjectResponse;

import java.util.List;

/** Feature 6: Detect Delayed/Inactive Projects. */
public interface ProjectHealthService {

    /**
     * Scans all non-completed projects and flags:
     *  - delayed: has at least one task past its dueDate that is not COMPLETED
     *  - inactive: no recorded activity (ProjectProgress.lastActivityAt) within the
     *              configured inactivity-threshold-days
     */
    List<DelayedProjectResponse> getDelayedAndInactiveProjects();
}
