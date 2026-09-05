package com.project.platform.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
    @NotBlank(message = "email is required")
    @Email(message = "enter a valid email")
    String email,

    @NotBlank(message = "password is required")
    String password
) {}
