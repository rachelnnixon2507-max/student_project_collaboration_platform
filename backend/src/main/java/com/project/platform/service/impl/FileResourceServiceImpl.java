package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateResourceLinkRequest;
import com.project.platform.dto.response.FileResourceResponse;
import com.project.platform.entity.FileResource;
import com.project.platform.entity.Project;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.FileResourceType;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.FileResourceRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.FileResourceService;
import com.project.platform.service.ProjectProgressService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of FileResourceService.
 * Owned by Member 2 - Team Collaboration.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class FileResourceServiceImpl implements FileResourceService {

    private final FileResourceRepository fileResourceRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectProgressService projectProgressService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private Path baseUploadPath;

    @PostConstruct
    public void init() {
        this.baseUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload storage location", e);
        }
    }

    @Override
    public FileResourceResponse uploadFile(Long projectId, MultipartFile file, String description, FileResourceType resourceType, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty file");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "unnamed_file";
        }
        // Clean filename of path traversal attempts
        String safeFileName = Paths.get(originalName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");

        Path projectDir = this.baseUploadPath.resolve("project_" + projectId);
        try {
            Files.createDirectories(projectDir);
            String storedFileName = UUID.randomUUID() + "_" + safeFileName;
            Path targetLocation = projectDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileResourceType resolvedType = (resourceType != null) ? resourceType : inferResourceType(safeFileName);

            FileResource resource = FileResource.builder()
                    .projectId(projectId)
                    .uploadedBy(currentUserId)
                    .fileName(safeFileName)
                    .fileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .fileSize(file.getSize())
                    .storagePath(targetLocation.toString())
                    .resourceType(resolvedType)
                    .description(description)
                    .build();

            FileResource saved = fileResourceRepository.save(resource);
            saved.setFileUrl("/api/files/download/" + saved.getId());
            saved = fileResourceRepository.save(saved);

            projectProgressService.recordProjectActivity(projectId);

            User uploader = userRepository.findById(currentUserId).orElse(null);
            return mapToResponse(saved, project.getTitle(), uploader != null ? uploader.getName() : "Unknown");
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + safeFileName, ex);
        }
    }

    @Override
    public FileResourceResponse addResourceLink(CreateResourceLinkRequest request, Long currentUserId) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));

        FileResourceType resType = request.resourceType() != null ? request.resourceType() : FileResourceType.LINK;

        FileResource resource = FileResource.builder()
                .projectId(request.projectId())
                .uploadedBy(currentUserId)
                .fileName(request.fileName().trim())
                .fileType("link/external")
                .fileSize(0L)
                .fileUrl(request.fileUrl().trim())
                .storagePath(null) // No physical file on server
                .resourceType(resType)
                .description(request.description())
                .build();

        FileResource saved = fileResourceRepository.save(resource);

        projectProgressService.recordProjectActivity(request.projectId());

        User uploader = userRepository.findById(currentUserId).orElse(null);
        return mapToResponse(saved, project.getTitle(), uploader != null ? uploader.getName() : "Unknown");
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResourceResponse> getProjectResources(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<FileResource> resources = fileResourceRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        return resources.stream().map(r -> {
            String uploaderName = userRepository.findById(r.getUploadedBy())
                    .map(User::getName)
                    .orElse("Unknown User");
            return mapToResponse(r, project.getTitle(), uploaderName);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FileResourceResponse getResourceById(Long id) {
        FileResource resource = findOrThrow(id);
        String projectTitle = projectRepository.findById(resource.getProjectId())
                .map(Project::getTitle)
                .orElse("Project #" + resource.getProjectId());
        String uploaderName = userRepository.findById(resource.getUploadedBy())
                .map(User::getName)
                .orElse("Unknown User");
        return mapToResponse(resource, projectTitle, uploaderName);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long id) {
        FileResource resource = findOrThrow(id);
        if (resource.getStoragePath() == null) {
            throw new BadRequestException("Resource is an external link, not a downloadable file. Direct URL: " + resource.getFileUrl());
        }

        try {
            Path filePath = Paths.get(resource.getStoragePath()).normalize();
            Resource res = new UrlResource(filePath.toUri());
            if (res.exists() && res.isReadable()) {
                return res;
            } else {
                throw new ResourceNotFoundException("File not found on disk for resource id: " + id);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path is invalid for resource id: " + id);
        }
    }

    @Override
    public void deleteResource(Long id, Long currentUserId) {
        FileResource resource = findOrThrow(id);

        // Clean up disk storage if it is a local file
        if (resource.getStoragePath() != null) {
            try {
                Path filePath = Paths.get(resource.getStoragePath());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
            }
        }

        fileResourceRepository.delete(resource);
    }

    private FileResource findOrThrow(Long id) {
        return fileResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File resource not found with id: " + id));
    }

    private FileResourceType inferResourceType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx") || lower.endsWith(".txt") || lower.endsWith(".md")) {
            return FileResourceType.DOCUMENT;
        } else if (lower.endsWith(".java") || lower.endsWith(".py") || lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".jsx") || lower.endsWith(".tsx") || lower.endsWith(".cpp") || lower.endsWith(".c") || lower.endsWith(".html") || lower.endsWith(".css") || lower.endsWith(".sql")) {
            return FileResourceType.CODE;
        } else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".svg") || lower.endsWith(".drawio")) {
            return FileResourceType.DIAGRAM;
        } else if (lower.endsWith(".csv") || lower.endsWith(".json") || lower.endsWith(".xlsx") || lower.endsWith(".xml")) {
            return FileResourceType.DATASET;
        }
        return FileResourceType.OTHER;
    }

    private FileResourceResponse mapToResponse(FileResource r, String projectTitle, String uploaderName) {
        String downloadUrl = r.getStoragePath() != null ? "/api/files/download/" + r.getId() : r.getFileUrl();
        return new FileResourceResponse(
                r.getId(),
                r.getProjectId(),
                projectTitle,
                r.getUploadedBy(),
                uploaderName,
                r.getFileName(),
                r.getFileType(),
                r.getFileSize(),
                r.getFileUrl(),
                r.getResourceType(),
                r.getDescription(),
                r.getCreatedAt(),
                downloadUrl
        );
    }
}
