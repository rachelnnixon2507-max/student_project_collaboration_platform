package com.project.platform.repository;

import com.project.platform.entity.Announcement;
import com.project.platform.entity.enums.AnnouncementScope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByScopeInOrderByCreatedAtDesc(java.util.List<AnnouncementScope> scopes, Pageable pageable);
    Page<Announcement> findByProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);
    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
