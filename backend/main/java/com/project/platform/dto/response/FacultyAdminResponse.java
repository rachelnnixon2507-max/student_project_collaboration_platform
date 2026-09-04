package com.project.platform.dto.response;

import com.project.platform.entity.enums.AccountStatus;

public record FacultyAdminResponse(
    Long userId,
    String name,
    String email,
    AccountStatus accountStatus,
    String department,
    String designation,
    String specialization
) {}
