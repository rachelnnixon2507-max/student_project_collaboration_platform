package com.project.platform.repository;

import com.project.platform.entity.TeamJoinRequest;
import com.project.platform.entity.enums.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    List<TeamJoinRequest> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<TeamJoinRequest> findByProjectIdAndStatus(Long projectId, JoinRequestStatus status);

    List<TeamJoinRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<TeamJoinRequest> findByProjectIdAndStudentIdAndStatus(Long projectId, Long studentId, JoinRequestStatus status);

    boolean existsByProjectIdAndStudentIdAndStatus(Long projectId, Long studentId, JoinRequestStatus status);

    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);

    void deleteByProjectId(Long projectId);
}
