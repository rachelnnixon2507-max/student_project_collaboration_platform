package com.project.platform.service;

import com.project.platform.dto.request.CreateResourceLinkRequest;
import com.project.platform.dto.response.FileResourceResponse;
import com.project.platform.entity.enums.FileResourceType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service for managing file uploads, downloads, and shared external project resources.
 * Owned by Member 2 - Team Collaboration.
 */
public interface FileResourceService {

    FileResourceResponse uploadFile(Long projectId, MultipartFile file, String description, FileResourceType resourceType, Long currentUserId);

    FileResourceResponse addResourceLink(CreateResourceLinkRequest request, Long currentUserId);

    List<FileResourceResponse> getProjectResources(Long projectId);

    FileResourceResponse getResourceById(Long id);

    Resource loadFileAsResource(Long id);

    void deleteResource(Long id, Long currentUserId);
}
