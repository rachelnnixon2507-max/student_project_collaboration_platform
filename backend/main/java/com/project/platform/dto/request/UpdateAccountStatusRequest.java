package com.project.platform.dto.request;

import com.project.platform.entity.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusRequest(
    @NotNull(message = "accountStatus is required") AccountStatus accountStatus
) {}
