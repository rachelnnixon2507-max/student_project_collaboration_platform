package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateAnnouncementRequest;
import com.project.platform.dto.response.AnnouncementResponse;
import com.project.platform.entity.Announcement;
import com.project.platform.entity.enums.AnnouncementScope;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.AnnouncementRepository;
import com.project.platform.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    @Override
    @Transactional
    public AnnouncementResponse create(CreateAnnouncementRequest request, Long createdByUserId) {
        if (request.scope() == AnnouncementScope.PROJECT && request.projectId() == null) {
            throw new BadRequestException("projectId is required when scope is PROJECT");
        }

        Announcement announcement = Announcement.builder()
            .title(request.title())
            .content(request.content())
            .scope(request.scope())
            .projectId(request.scope() == AnnouncementScope.PROJECT ? request.projectId() : null)
            .createdBy(createdByUserId)
            .build();

        return toResponse(announcementRepository.save(announcement));
    }

    @Override
    public Page<AnnouncementResponse> getVisibleAnnouncements(Role viewerRole, Pageable pageable) {
        List<AnnouncementScope> scopes = switch (viewerRole) {
            case STUDENT -> List.of(AnnouncementScope.ALL, AnnouncementScope.STUDENTS);
            case FACULTY -> List.of(AnnouncementScope.ALL, AnnouncementScope.FACULTY);
            case ADMIN -> List.of(AnnouncementScope.ALL, AnnouncementScope.STUDENTS, AnnouncementScope.FACULTY);
        };
        return announcementRepository.findByScopeInOrderByCreatedAtDesc(scopes, pageable).map(this::toResponse);
    }

    @Override
    public Page<AnnouncementResponse> getByProject(Long projectId, Pageable pageable) {
        return announcementRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable).map(this::toResponse);
    }

    @Override
    public AnnouncementResponse getById(Long announcementId) {
        return toResponse(findOrThrow(announcementId));
    }

    @Override
    @Transactional
    public void delete(Long announcementId) {
        announcementRepository.delete(findOrThrow(announcementId));
    }

    private Announcement findOrThrow(Long id) {
        return announcementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return new AnnouncementResponse(
            a.getId(), a.getTitle(), a.getContent(), a.getScope(), a.getProjectId(), a.getCreatedBy(), a.getCreatedAt()
        );
    }
}
