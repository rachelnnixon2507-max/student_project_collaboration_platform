package com.project.platform.repository;

import com.project.platform.entity.FileResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for FileResource entity.
 * Owned by Member 2 - Team Collaboration.
 */
@Repository
public interface FileResourceRepository extends JpaRepository<FileResource, Long> {


    List<FileResource> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    long countByProjectId(Long projectId);

    List<FileResource> findByUploadedBy(Long uploadedBy);
}
