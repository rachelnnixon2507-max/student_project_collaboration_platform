package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateTeamMemberReviewRequest;
import com.project.platform.dto.response.RevieweeRatingSummaryResponse;
import com.project.platform.dto.response.TeamMemberReviewResponse;
import com.project.platform.entity.TeamMemberReview;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.DuplicateResourceException;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.TeamMemberReviewRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.TeamMemberReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamMemberReviewServiceImpl implements TeamMemberReviewService {

    private final TeamMemberReviewRepository teamMemberReviewRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TeamMemberReviewResponse createReview(CreateTeamMemberReviewRequest request, Long reviewerId) {
        if (reviewerId.equals(request.revieweeId())) {
            throw new BadRequestException("You cannot review yourself");
        }

        User reviewer = userRepository.findById(reviewerId).orElse(null);
        boolean isAdmin = reviewer != null && reviewer.getRole() == Role.ADMIN;

        boolean reviewerInProject = isAdmin || projectMemberRepository
            .existsByProjectIdAndStudentId(request.projectId(), reviewerId);
        boolean revieweeInProject = projectMemberRepository
            .existsByProjectIdAndStudentId(request.projectId(), request.revieweeId());

        if (!reviewerInProject || (!isAdmin && !revieweeInProject)) {
            throw new BadRequestException("Both the reviewer and the reviewee must be members of the project");
        }

        boolean alreadyReviewed = teamMemberReviewRepository
            .existsByProjectIdAndReviewerIdAndRevieweeId(request.projectId(), reviewerId, request.revieweeId());
        if (alreadyReviewed) {
            throw new DuplicateResourceException("You have already reviewed this team member for this project");
        }

        TeamMemberReview review = TeamMemberReview.builder()
            .projectId(request.projectId())
            .reviewerId(reviewerId)
            .revieweeId(request.revieweeId())
            .rating(request.rating())
            .comments(request.comments())
            .build();

        return toResponse(teamMemberReviewRepository.save(review));
    }

    @Override
    public List<TeamMemberReviewResponse> getReviewsForProject(Long projectId) {
        return teamMemberReviewRepository.findByProjectId(projectId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public RevieweeRatingSummaryResponse getRatingSummaryForStudent(Long studentUserId) {
        List<TeamMemberReviewResponse> reviews = teamMemberReviewRepository.findByRevieweeId(studentUserId).stream()
            .map(this::toResponse)
            .toList();

        Double avg = teamMemberReviewRepository.findAverageRatingForReviewee(studentUserId);

        return new RevieweeRatingSummaryResponse(
            studentUserId,
            avg != null ? avg : 0.0,
            reviews.size(),
            reviews
        );
    }

    private TeamMemberReviewResponse toResponse(TeamMemberReview r) {
        return new TeamMemberReviewResponse(
            r.getId(), r.getProjectId(), r.getReviewerId(), r.getRevieweeId(),
            r.getRating(), r.getComments(), r.getCreatedAt()
        );
    }
}
