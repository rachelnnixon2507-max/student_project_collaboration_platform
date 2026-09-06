package com.project.platform.controller;

import com.project.platform.dto.request.AiMatchCustomRequest;
import com.project.platform.dto.response.AiCandidateMatchResponse;
import com.project.platform.dto.response.AiProjectMatchResponse;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.AiMatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for AI Smart Team Matching and team discovery.
 * Owned by Member 2 - Team Collaboration.
 */
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamCollaborationController {

    private final AiMatchingService aiMatchingService;

    @GetMapping("/match-candidates/{projectId}")
    public ApiResponse<List<AiCandidateMatchResponse>> getMatchingCandidatesForProject(
            @PathVariable Long projectId,
            @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        List<AiCandidateMatchResponse> candidates = aiMatchingService.matchCandidatesForProject(projectId, limit);
        return ApiResponse.ok(candidates);
    }

    @GetMapping("/match-projects")
    public ApiResponse<List<AiProjectMatchResponse>> getMatchingProjectsForStudent(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long targetStudentId = (studentId != null) ? studentId : (principal != null ? principal.getId() : 1L);
        List<AiProjectMatchResponse> projects = aiMatchingService.matchProjectsForStudent(targetStudentId, limit);
        return ApiResponse.ok(projects);
    }

    @PostMapping("/ai-match/custom")
    public ApiResponse<List<AiCandidateMatchResponse>> matchCandidatesCustom(
            @Valid @RequestBody AiMatchCustomRequest request
    ) {
        List<AiCandidateMatchResponse> candidates = aiMatchingService.matchCustomSkills(request);
        return ApiResponse.ok(candidates);
    }
}
