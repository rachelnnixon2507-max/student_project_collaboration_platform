package com.project.platform.repository;

import com.project.platform.entity.Project;
import com.project.platform.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    java.util.List<Project> findByStatus(ProjectStatus status);
    long countByStatus(ProjectStatus status);
}

