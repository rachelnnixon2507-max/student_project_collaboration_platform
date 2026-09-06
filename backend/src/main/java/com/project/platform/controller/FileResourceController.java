package com.project.platform.controller;

import com.project.platform.dto.request.CreateResourceLinkRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.FileResourceResponse;
import com.project.platform.entity.enums.FileResourceType;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.FileResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for File & Resource Sharing.
 * Owned by Member 2 - Team Collaboration.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileResourceController {

    private final FileResourceService fileResourceService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileResourceResponse> uploadFile(
            @RequestParam("projectId") Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "resourceType", required = false) FileResourceType resourceType,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        FileResourceResponse response = fileResourceService.uploadFile(projectId, file, description, resourceType, currentUserId);
        return ApiResponse.ok("File uploaded successfully", response);
    }

    @PostMapping("/resource")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileResourceResponse> addResourceLink(
            @Valid @RequestBody CreateResourceLinkRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        FileResourceResponse response = fileResourceService.addResourceLink(request, currentUserId);
        return ApiResponse.ok("Resource link shared successfully", response);
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<FileResourceResponse>> getProjectResources(@PathVariable Long projectId) {
        List<FileResourceResponse> resources = fileResourceService.getProjectResources(projectId);
        return ApiResponse.ok(resources);
    }

    @GetMapping("/{id}")
    public ApiResponse<FileResourceResponse> getResourceById(@PathVariable Long id) {
        FileResourceResponse response = fileResourceService.getResourceById(id);
        return ApiResponse.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        FileResourceResponse metadata = fileResourceService.getResourceById(id);
        Resource fileResource = fileResourceService.loadFileAsResource(id);

        String contentType = metadata.fileType() != null ? metadata.fileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.fileName() + "\"")
                .body(fileResource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResource(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        fileResourceService.deleteResource(id, currentUserId);
        return ApiResponse.ok("Resource deleted successfully", null);
    }
}
