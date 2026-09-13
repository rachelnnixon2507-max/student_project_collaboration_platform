package com.project.platform.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload for inviting an AI matched candidate student to a project team.
 * Owned by Member 2 - Team Collaboration.
 */
public record InviteCandidateRequest(
    @NotNull(message = "projectId is required")
    Long projectId,

    @NotNull(message = "candidateStudentId is required")
    Long candidateStudentId,

    String message
) {}
