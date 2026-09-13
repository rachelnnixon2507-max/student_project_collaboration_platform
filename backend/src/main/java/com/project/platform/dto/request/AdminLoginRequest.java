package com.project.platform.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
    @NotBlank(message = "Email or Institutional ID is required")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {}

