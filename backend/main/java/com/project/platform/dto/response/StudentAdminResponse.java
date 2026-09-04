package com.project.platform.dto.response;

import com.project.platform.entity.enums.AccountStatus;

public record StudentAdminResponse(
    Long userId,
    String name,
    String email,
    AccountStatus accountStatus,
    String department,
    String skills,
    String githubUrl,
    String linkedinUrl
) {}
