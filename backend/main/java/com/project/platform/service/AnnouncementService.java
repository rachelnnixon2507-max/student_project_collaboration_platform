package com.project.platform.service;

import com.project.platform.dto.request.CreateAnnouncementRequest;
import com.project.platform.dto.response.AnnouncementResponse;
import com.project.platform.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Feature 5: Send Announcements. */
public interface AnnouncementService {

    AnnouncementResponse create(CreateAnnouncementRequest request, Long createdByUserId);

    /** Returns announcements visible to a user with the given role (ALL + role-matching scope). */
    Page<AnnouncementResponse> getVisibleAnnouncements(Role viewerRole, Pageable pageable);

    Page<AnnouncementResponse> getByProject(Long projectId, Pageable pageable);

    AnnouncementResponse getById(Long announcementId);

    void delete(Long announcementId);
}
