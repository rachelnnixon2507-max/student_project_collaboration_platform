package com.project.platform.dto.response;

public record AdminStatusResponse(
    boolean adminExists,
    String message
) {}
