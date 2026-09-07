package com.project.platform.repository;

import com.project.platform.entity.Project;
import com.project.platform.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    List<Project> findByStatus(ProjectStatus status);

    long countByStatus(ProjectStatus status);

    List<Project> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    Page<Project> findByCreatedByOrderByCreatedAtDesc(Long createdBy, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:skill IS NULL OR LOWER(p.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%')))")
    Page<Project> searchProjects(@Param("keyword") String keyword,
                                @Param("skill") String skill,
                                @Param("status") ProjectStatus status,
                                Pageable pageable);
}
