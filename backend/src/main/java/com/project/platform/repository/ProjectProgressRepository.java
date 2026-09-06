package com.project.platform.repository;

import com.project.platform.entity.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {

    Optional<ProjectProgress> findByProjectId(Long projectId);
    List<ProjectProgress> findByLastActivityAtBefore(LocalDateTime cutoff);
}
