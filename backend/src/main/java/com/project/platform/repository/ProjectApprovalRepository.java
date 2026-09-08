package com.project.platform.repository;

import com.project.platform.entity.ProjectApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectApprovalRepository extends JpaRepository<ProjectApproval, Long> {

    List<ProjectApproval> findByProjectIdOrderByDecidedAtDesc(Long projectId);

    Optional<ProjectApproval> findTopByProjectIdOrderByDecidedAtDesc(Long projectId);

    long countByProjectId(Long projectId);
}
