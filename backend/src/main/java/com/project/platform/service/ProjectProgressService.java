package com.project.platform.service;

import com.project.platform.dto.response.ProjectProgressDetailsResponse;
import com.project.platform.entity.ProjectProgress;

/**
 * Service for tracking project progress, activity, and health indicators.
 * Owned by Member 2 - Team Collaboration.
 */
public interface ProjectProgressService {

    ProjectProgressDetailsResponse getProjectProgressDetails(Long projectId);

    ProjectProgress recalculateAndSaveProgress(Long projectId);

    ProjectProgress recordProjectActivity(Long projectId);

    ProjectProgress manualUpdateProgress(Long projectId, Integer overallProgress, String reason);

    ProjectProgress findOrCreateProgress(Long projectId);
}
