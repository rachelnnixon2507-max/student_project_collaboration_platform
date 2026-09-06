package com.project.platform.service;

import com.project.platform.dto.request.AiMatchCustomRequest;
import com.project.platform.dto.response.AiCandidateMatchResponse;
import com.project.platform.dto.response.AiProjectMatchResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectMember;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.CompatibilityLevel;
import com.project.platform.entity.enums.ProjectMemberRole;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.impl.AiMatchingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiMatchingServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private AiMatchingServiceImpl aiMatchingService;

    private Project sampleProject;
    private User student1;
    private User student2;

    @BeforeEach
    void setUp() {
        sampleProject = Project.builder()
                .id(1L)
                .title("Smart Campus Logistics")
                .description("Automated inventory and tracking system")
                .requiredSkills("Java, Spring Boot, React, MySQL")
                .status(ProjectStatus.OPEN)
                .createdBy(99L)
                .createdAt(LocalDateTime.now())
                .build();

        student1 = User.builder()
                .id(10L)
                .name("Kavya Sharma")
                .email("kavya@college.edu")
                .role(Role.STUDENT)
                .build();

        student2 = User.builder()
                .id(20L)
                .name("Vikram Seth")
                .email("vikram@college.edu")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    @DisplayName("AI Matching ranks candidate with matching skills higher")
    void testMatchCandidatesForProject() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleProject));
        when(projectMemberRepository.findByProjectId(1L)).thenReturn(List.of());
        when(userRepository.findByRole(Role.STUDENT)).thenReturn(List.of(student1, student2));

        // student1 has high skill overlap
        StudentProfile p1 = StudentProfile.builder()
                .userId(10L)
                .department("CSE")
                .skills("Java, Spring Boot, React, Docker")
                .bio("Backend engineer")
                .build();

        // student2 has low/different skill overlap
        StudentProfile p2 = StudentProfile.builder()
                .userId(20L)
                .department("ECE")
                .skills("C++, Embedded Systems, Arduino")
                .bio("Hardware robotics")
                .build();

        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(p1));
        when(studentProfileRepository.findByUserId(20L)).thenReturn(Optional.of(p2));
        when(studentProfileRepository.findByUserId(99L)).thenReturn(Optional.empty());

        List<AiCandidateMatchResponse> candidates = aiMatchingService.matchCandidatesForProject(1L, 10);

        assertNotNull(candidates);
        assertEquals(2, candidates.size());

        // First candidate should be student1 with higher score
        AiCandidateMatchResponse top = candidates.get(0);
        assertEquals(10L, top.studentId());
        assertTrue(top.matchScore() > candidates.get(1).matchScore());
        assertTrue(top.matchedSkills().contains("Java"));
        assertTrue(top.matchedSkills().contains("Spring Boot"));
        assertTrue(top.matchedSkills().contains("React"));
        assertNotNull(top.recommendationRationale());
    }

    @Test
    @DisplayName("AI Matching recommends relevant projects for a student")
    void testMatchProjectsForStudent() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(student1));
        when(projectMemberRepository.findByStudentId(10L)).thenReturn(List.of());

        StudentProfile p1 = StudentProfile.builder()
                .userId(10L)
                .department("CSE")
                .skills("Java, Spring Boot, React")
                .build();
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(p1));

        Project pA = Project.builder().id(100L).title("Web Portal").requiredSkills("Java, Spring Boot").status(ProjectStatus.OPEN).createdBy(5L).build();
        Project pB = Project.builder().id(200L).title("Embedded Rover").requiredSkills("C, Assembly").status(ProjectStatus.OPEN).createdBy(6L).build();

        when(projectRepository.findByStatus(ProjectStatus.OPEN)).thenReturn(List.of(pA, pB));
        when(projectRepository.findByStatus(ProjectStatus.IN_PROGRESS)).thenReturn(List.of());

        List<AiProjectMatchResponse> recommendations = aiMatchingService.matchProjectsForStudent(10L, 5);

        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());
        assertEquals(100L, recommendations.get(0).projectId(), "Web Portal matching Java/Spring should be top recommended");
        assertTrue(recommendations.get(0).matchScore() > recommendations.get(1).matchScore());
    }

    @Test
    @DisplayName("Custom skills matching filters and scores candidates properly")
    void testMatchCustomSkills() {
        when(userRepository.findByRole(Role.STUDENT)).thenReturn(List.of(student1));
        StudentProfile p1 = StudentProfile.builder()
                .userId(10L)
                .department("CSE")
                .skills("Python, Machine Learning, PyTorch")
                .build();
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(p1));

        AiMatchCustomRequest req = new AiMatchCustomRequest("Python, Machine Learning", "CSE", 5);
        List<AiCandidateMatchResponse> results = aiMatchingService.matchCustomSkills(req);

        assertEquals(1, results.size());
        assertEquals(10L, results.get(0).studentId());
        assertTrue(results.get(0).matchScore() >= 80);
        assertEquals(CompatibilityLevel.EXCELLENT, results.get(0).compatibility());
    }
}
