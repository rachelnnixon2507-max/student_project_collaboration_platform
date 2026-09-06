package com.project.platform.service;

import com.project.platform.dto.request.AiMatchCustomRequest;
import com.project.platform.dto.response.AiCandidateMatchResponse;
import com.project.platform.dto.response.AiProjectMatchResponse;

import java.util.List;

/**
 * AI Smart Team Matching engine for skill-based teammate discovery and project recommendations.
 * Owned by Member 2 - Team Collaboration.
 */
public interface AiMatchingService {

    List<AiCandidateMatchResponse> matchCandidatesForProject(Long projectId, Integer maxResults);

    List<AiProjectMatchResponse> matchProjectsForStudent(Long studentId, Integer maxResults);

    List<AiCandidateMatchResponse> matchCustomSkills(AiMatchCustomRequest request);
}
