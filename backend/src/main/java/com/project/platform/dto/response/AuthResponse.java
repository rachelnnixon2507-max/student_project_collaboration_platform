package com.project.platform.dto.response;

public record AuthResponse(
    String token,
    Long userId,
    String institutionalId,
    String name,
    String email,
    String role
) {}

