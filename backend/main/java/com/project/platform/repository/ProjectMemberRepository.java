package com.project.platform.repository;

import com.project.platform.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByStudentId(Long studentId);
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
}
