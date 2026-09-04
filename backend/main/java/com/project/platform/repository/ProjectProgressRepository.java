package com.project.platform.repository;

import com.project.platform.entity.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {
    Optional<ProjectProgress> findByProjectId(Long projectId);
    List<ProjectProgress> findByLastActivityAtBefore(LocalDateTime cutoff);
}
