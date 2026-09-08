package com.project.platform.repository;

import com.project.platform.entity.FacultyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultyFeedbackRepository extends JpaRepository<FacultyFeedback, Long> {

    List<FacultyFeedback> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<FacultyFeedback> findByProjectIdAndFacultyIdOrderByCreatedAtDesc(Long projectId, Long facultyId);

    List<FacultyFeedback> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    long countByProjectId(Long projectId);
}
