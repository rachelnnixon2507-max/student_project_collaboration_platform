package com.project.platform.dto.response;

import com.project.platform.entity.enums.CompatibilityLevel;

import java.util.List;

/**
 * AI Team Matching candidate response for a project.
 * Owned by Member 2 - Team Collaboration.
 */
public record AiCandidateMatchResponse(
    Long studentId,
    String name,
    String email,
    String department,
    String skills,
    String bio,
    String githubUrl,
    String linkedinUrl,
    int matchScore,
    List<String> matchedSkills,
    List<String> missingSkills,
    CompatibilityLevel compatibility,
    String recommendationRationale
) {}
