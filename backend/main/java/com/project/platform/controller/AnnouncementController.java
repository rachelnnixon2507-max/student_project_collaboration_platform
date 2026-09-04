package com.project.platform.controller;

import com.project.platform.dto.request.CreateAnnouncementRequest;
import com.project.platform.dto.response.AnnouncementResponse;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Feature 5: Send Announcements.
 * Creating/deleting is ADMIN-only. Reading is open to any authenticated user
 * (students/faculty see announcements relevant to their role).
 */
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AnnouncementResponse> create(
        @Valid @RequestBody CreateAnnouncementRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        AnnouncementResponse created = announcementService.create(request, principal.getId());
        return ApiResponse.ok("Announcement sent", created);
    }

    @GetMapping
    public ApiResponse<Page<AnnouncementResponse>> getVisible(
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(
            announcementService.getVisibleAnnouncements(principal.getUser().getRole(), pageable)
        );
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<Page<AnnouncementResponse>> getByProject(
        @PathVariable Long projectId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(announcementService.getByProject(projectId, pageable));
    }

    @GetMapping("/{announcementId}")
    public ApiResponse<AnnouncementResponse> getById(@PathVariable Long announcementId) {
        return ApiResponse.ok(announcementService.getById(announcementId));
    }

    @DeleteMapping("/{announcementId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long announcementId) {
        announcementService.delete(announcementId);
    }
}
