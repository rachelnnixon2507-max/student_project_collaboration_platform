package com.project.platform.dto.request;

import com.project.platform.entity.enums.AnnouncementScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAnnouncementRequest(
    @NotBlank(message = "title is required") String title,
    @NotBlank(message = "content is required") String content,
    @NotNull(message = "scope is required") AnnouncementScope scope,
    Long projectId // required only when scope == PROJECT
) {}
