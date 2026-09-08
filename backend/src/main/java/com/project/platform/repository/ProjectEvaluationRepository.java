package com.project.platform.repository;

import com.project.platform.entity.ProjectEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectEvaluationRepository extends JpaRepository<ProjectEvaluation, Long> {

    List<ProjectEvaluation> findByProjectIdOrderByEvaluatedAtDesc(Long projectId);

    Optional<ProjectEvaluation> findByProjectIdAndEvaluatorId(Long projectId, Long evaluatorId);

    Optional<ProjectEvaluation> findTopByProjectIdOrderByEvaluatedAtDesc(Long projectId);

    long countByProjectId(Long projectId);
}
