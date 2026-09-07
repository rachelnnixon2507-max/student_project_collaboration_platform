package com.project.platform.dto.response;

import java.time.LocalDateTime;

public record StudentProfileResponse(
    Long id,
    Long userId,
    String name,
    String email,
    String department,
    String skills,
    String bio,
    String githubUrl,
    String linkedinUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
