package com.project.platform.service.impl;

import com.project.platform.dto.request.AiMatchCustomRequest;
import com.project.platform.dto.response.AiCandidateMatchResponse;
import com.project.platform.dto.response.AiProjectMatchResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectMember;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.CompatibilityLevel;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.AiMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of AiMatchingService.
 * Owned by Member 2 - Team Collaboration.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiMatchingServiceImpl implements AiMatchingService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Override
    public List<AiCandidateMatchResponse> matchCandidatesForProject(Long projectId, Integer maxResults) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Existing members to exclude
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        Set<Long> existingMemberIds = members.stream()
                .map(ProjectMember::getStudentId)
                .collect(Collectors.toSet());
        existingMemberIds.add(project.getCreatedBy());

        // Discover what skills are already covered by existing members
        Set<String> alreadyCoveredSkills = new HashSet<>();
        for (Long memberId : existingMemberIds) {
            studentProfileRepository.findByUserId(memberId).ifPresent(p -> {
                if (p.getSkills() != null) {
                    alreadyCoveredSkills.addAll(parseSkills(p.getSkills()));
                }
            });
        }

        List<String> requiredSkills = parseSkills(project.getRequiredSkills());
        List<User> students = userRepository.findByRole(Role.STUDENT);

        List<AiCandidateMatchResponse> scoredCandidates = new ArrayList<>();
        int limit = (maxResults != null && maxResults > 0) ? maxResults : 10;

        for (User student : students) {
            if (existingMemberIds.contains(student.getId())) {
                continue; // exclude existing members
            }

            StudentProfile profile = studentProfileRepository.findByUserId(student.getId()).orElse(null);
            CandidateScore score = calculateCandidateScore(
                    requiredSkills,
                    profile != null ? profile.getSkills() : null,
                    profile != null ? profile.getDepartment() : null,
                    alreadyCoveredSkills
            );

            String rationale = buildCandidateRationale(student.getName(), project.getTitle(), score, requiredSkills.size());

            scoredCandidates.add(new AiCandidateMatchResponse(
                    student.getId(),
                    student.getName(),
                    student.getEmail(),
                    profile != null ? profile.getDepartment() : "General",
                    profile != null ? profile.getSkills() : "None listed",
                    profile != null ? profile.getBio() : "",
                    profile != null ? profile.getGithubUrl() : "",
                    profile != null ? profile.getLinkedinUrl() : "",
                    score.matchScore,
                    score.matchedSkills,
                    score.missingSkills,
                    score.compatibility,
                    rationale
            ));
        }

        // Rank by matchScore descending
        scoredCandidates.sort(Comparator.comparingInt(AiCandidateMatchResponse::matchScore).reversed());
        return scoredCandidates.stream().limit(limit).toList();
    }

    @Override
    public List<AiProjectMatchResponse> matchProjectsForStudent(Long studentId, Integer maxResults) {
        if (!userRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }

        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);

        // Projects student is already part of
        Set<Long> joinedProjectIds = projectMemberRepository.findByStudentId(studentId).stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        // Find candidate projects: OPEN or IN_PROGRESS
        List<Project> activeProjects = new ArrayList<>();
        activeProjects.addAll(projectRepository.findByStatus(ProjectStatus.OPEN));
        activeProjects.addAll(projectRepository.findByStatus(ProjectStatus.IN_PROGRESS));

        int limit = (maxResults != null && maxResults > 0) ? maxResults : 10;
        List<AiProjectMatchResponse> recommendations = new ArrayList<>();

        for (Project project : activeProjects) {
            if (joinedProjectIds.contains(project.getId()) || Objects.equals(project.getCreatedBy(), studentId)) {
                continue; // Skip projects where user is already leader/member
            }

            List<String> requiredSkills = parseSkills(project.getRequiredSkills());
            CandidateScore score = calculateCandidateScore(
                    requiredSkills,
                    profile != null ? profile.getSkills() : null,
                    profile != null ? profile.getDepartment() : null,
                    Collections.emptySet()
            );

            String leaderName = userRepository.findById(project.getCreatedBy())
                    .map(User::getName)
                    .orElse("Project Leader");

            String rationale = buildProjectRecommendationRationale(project.getTitle(), score, requiredSkills.size());

            recommendations.add(new AiProjectMatchResponse(
                    project.getId(),
                    project.getTitle(),
                    project.getDescription(),
                    project.getRequiredSkills(),
                    project.getStatus().name(),
                    project.getCreatedBy(),
                    leaderName,
                    score.matchScore,
                    score.matchedSkills,
                    score.missingSkills,
                    score.compatibility,
                    rationale
            ));
        }

        recommendations.sort(Comparator.comparingInt(AiProjectMatchResponse::matchScore).reversed());
        return recommendations.stream().limit(limit).toList();
    }

    @Override
    public List<AiCandidateMatchResponse> matchCustomSkills(AiMatchCustomRequest request) {
        List<String> requiredSkills = parseSkills(request.requiredSkills());
        List<User> students = userRepository.findByRole(Role.STUDENT);

        int limit = (request.maxResults() != null && request.maxResults() > 0) ? request.maxResults() : 10;
        List<AiCandidateMatchResponse> results = new ArrayList<>();

        for (User student : students) {
            StudentProfile profile = studentProfileRepository.findByUserId(student.getId()).orElse(null);
            if (request.department() != null && !request.department().isBlank()) {
                if (profile == null || profile.getDepartment() == null ||
                        !profile.getDepartment().equalsIgnoreCase(request.department().trim())) {
                    continue;
                }
            }

            CandidateScore score = calculateCandidateScore(
                    requiredSkills,
                    profile != null ? profile.getSkills() : null,
                    profile != null ? profile.getDepartment() : null,
                    Collections.emptySet()
            );

            String rationale = "Candidate matches " + score.matchedSkills.size() + " of " + requiredSkills.size() +
                    " requested skills (" + String.join(", ", score.matchedSkills) + ").";

            results.add(new AiCandidateMatchResponse(
                    student.getId(),
                    student.getName(),
                    student.getEmail(),
                    profile != null ? profile.getDepartment() : "General",
                    profile != null ? profile.getSkills() : "None listed",
                    profile != null ? profile.getBio() : "",
                    profile != null ? profile.getGithubUrl() : "",
                    profile != null ? profile.getLinkedinUrl() : "",
                    score.matchScore,
                    score.matchedSkills,
                    score.missingSkills,
                    score.compatibility,
                    rationale
            ));
        }

        results.sort(Comparator.comparingInt(AiCandidateMatchResponse::matchScore).reversed());
        return results.stream().limit(limit).toList();
    }

    // Helper methods for smart skill matching and scoring

    private record CandidateScore(
            int matchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            CompatibilityLevel compatibility,
            int gapFillingSkillsCount
    ) {}

    private CandidateScore calculateCandidateScore(
            List<String> requiredSkills,
            String candidateSkillsRaw,
            String department,
            Set<String> alreadyCoveredSkills
    ) {
        List<String> candidateSkills = parseSkills(candidateSkillsRaw);

        if (requiredSkills.isEmpty()) {
            return new CandidateScore(50, Collections.emptyList(), Collections.emptyList(), CompatibilityLevel.MODERATE, 0);
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        int gapFillingCount = 0;

        for (String req : requiredSkills) {
            boolean found = false;
            for (String cand : candidateSkills) {
                if (isSkillMatch(req, cand)) {
                    found = true;
                    matched.add(req);
                    // Check if candidate fills a gap that the rest of the team doesn't have
                    boolean alreadyCovered = alreadyCoveredSkills.stream().anyMatch(s -> isSkillMatch(req, s));
                    if (!alreadyCovered) {
                        gapFillingCount++;
                    }
                    break;
                }
            }
            if (!found) {
                missing.add(req);
            }
        }

        // Base match ratio: 0.0 to 1.0
        double baseRatio = (double) matched.size() / requiredSkills.size();
        double score = baseRatio * 80.0; // max 80 from base matches

        // Synergy bonus for covering unfilled gaps in the team (up to 15 points)
        if (gapFillingCount > 0) {
            score += Math.min(15.0, gapFillingCount * 7.5);
        }

        // Department relevance bonus (5 points)
        if (department != null && (department.equalsIgnoreCase("CSE") || department.equalsIgnoreCase("IT") || department.equalsIgnoreCase("ECE"))) {
            score += 5.0;
        }

        int finalScore = Math.min(100, Math.max(5, (int) Math.round(score)));

        CompatibilityLevel compatibility;
        if (finalScore >= 80) {
            compatibility = CompatibilityLevel.EXCELLENT;
        } else if (finalScore >= 60) {
            compatibility = CompatibilityLevel.GOOD;
        } else if (finalScore >= 40) {
            compatibility = CompatibilityLevel.MODERATE;
        } else {
            compatibility = CompatibilityLevel.LOW;
        }

        return new CandidateScore(finalScore, matched, missing, compatibility, gapFillingCount);
    }

    private boolean isSkillMatch(String s1, String s2) {
        if (s1 == null || s2 == null) return false;
        String a = normalize(s1);
        String b = normalize(s2);

        if (a.equals(b)) return true;
        if (a.contains(b) || b.contains(a)) return true;

        // Common synonyms / tech equivalents
        if ((a.contains("react") && b.contains("react")) ||
            (a.contains("spring") && b.contains("spring")) ||
            (a.contains("node") && b.contains("node")) ||
            (a.contains("sql") && b.contains("sql")) ||
            (a.contains("python") && b.contains("python")) ||
            (a.contains("java") && !a.contains("script") && b.contains("java") && !b.contains("script")) ||
            (a.contains("mongo") && b.contains("mongo")) ||
            (a.contains("docker") && b.contains("container")) ||
            (a.contains("iot") && (b.contains("sensor") || b.contains("hardware") || b.contains("embedded")))) {
            return true;
        }

        return false;
    }

    private String normalize(String skill) {
        return skill.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private List<String> parseSkills(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split("[,;/|]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();
    }

    private String buildCandidateRationale(String candidateName, String projectTitle, CandidateScore score, int totalRequired) {
        if (score.matchedSkills.isEmpty()) {
            return candidateName + " currently has no direct overlap with the required skills for " + projectTitle + ", but may bring foundational learning capacity.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Matches ").append(score.matchedSkills.size()).append(" of ").append(totalRequired)
                .append(" required skills (").append(String.join(", ", score.matchedSkills)).append(").");

        if (score.gapFillingSkillsCount > 0) {
            sb.append(" Fills ").append(score.gapFillingSkillsCount).append(" unaddressed skill gap(s) needed by the team.");
        }

        if (score.compatibility == CompatibilityLevel.EXCELLENT) {
            sb.append(" Highly recommended as a core contributor.");
        } else if (score.compatibility == CompatibilityLevel.GOOD) {
            sb.append(" Strong potential collaborator with relevant tech stack.");
        }

        return sb.toString();
    }

    private String buildProjectRecommendationRationale(String projectTitle, CandidateScore score, int totalRequired) {
        if (score.matchedSkills.isEmpty()) {
            return "Project provides an opportunity to explore new technologies outside your current core stack.";
        }
        return "Your skillset matches " + score.matchedSkills.size() + " of " + totalRequired +
                " required skills for " + projectTitle + " (" + String.join(", ", score.matchedSkills) + ").";
    }
}
