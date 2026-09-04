package com.project.platform.repository;

import com.project.platform.entity.TeamMemberReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberReviewRepository extends JpaRepository<TeamMemberReview, Long> {
    List<TeamMemberReview> findByRevieweeId(Long revieweeId);
    List<TeamMemberReview> findByProjectId(Long projectId);
    Optional<TeamMemberReview> findByProjectIdAndReviewerIdAndRevieweeId(Long projectId, Long reviewerId, Long revieweeId);
    boolean existsByProjectIdAndReviewerIdAndRevieweeId(Long projectId, Long reviewerId, Long revieweeId);

    @org.springframework.data.jpa.repository.Query(
        "select avg(r.rating) from TeamMemberReview r where r.revieweeId = :revieweeId"
    )
    Double findAverageRatingForReviewee(Long revieweeId);
}
