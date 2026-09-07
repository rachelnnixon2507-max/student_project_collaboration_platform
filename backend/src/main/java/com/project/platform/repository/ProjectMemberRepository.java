package com.project.platform.repository;

import com.project.platform.entity.ProjectMember;
import com.project.platform.entity.enums.ProjectMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByStudentId(Long studentId);

    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);

    Optional<ProjectMember> findByProjectIdAndStudentId(Long projectId, Long studentId);

    List<ProjectMember> findByProjectIdAndRole(Long projectId, ProjectMemberRole role);

    void deleteByProjectIdAndStudentId(Long projectId, Long studentId);

    void deleteByProjectId(Long projectId);

    long countByProjectId(Long projectId);
}
