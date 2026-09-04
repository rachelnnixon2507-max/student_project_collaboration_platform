package com.project.platform.dto.response;

import com.project.platform.entity.enums.AccountStatus;
import com.project.platform.entity.enums.Role;

import java.time.LocalDateTime;

public record UserAdminResponse(
    Long id,
    String name,
    String email,
    Role role,
    AccountStatus accountStatus,
    LocalDateTime createdAt
) {}
