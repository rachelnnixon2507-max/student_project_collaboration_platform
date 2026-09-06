package com.project.platform.dto.response;

import com.project.platform.entity.enums.FileResourceType;

import java.time.LocalDateTime;

/**
 * Detailed representation of a project file or shared resource.
 * Owned by Member 2 - Team Collaboration.
 */
public record FileResourceResponse(
    Long id,
    Long projectId,
    String projectTitle,
    Long uploadedBy,
    String uploaderName,
    String fileName,
    String fileType,
    Long fileSize,
    String fileUrl,
    FileResourceType resourceType,
    String description,
    LocalDateTime createdAt,
    String downloadUrl
) {}
