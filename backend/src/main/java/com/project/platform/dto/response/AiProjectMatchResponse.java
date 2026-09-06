package com.project.platform.dto.response;

import com.project.platform.entity.enums.CompatibilityLevel;

import java.util.List;

/**
 * AI Project recommendation response for a student.
 * Owned by Member 2 - Team Collaboration.
 */
public record AiProjectMatchResponse(
    Long projectId,
    String projectTitle,
    String description,
    String requiredSkills,
    String projectStatus,
    Long leaderId,
    String leaderName,
    int matchScore,
    List<String> matchedSkills,
    List<String> missingSkills,
    CompatibilityLevel compatibility,
    String recommendationRationale
) {}
