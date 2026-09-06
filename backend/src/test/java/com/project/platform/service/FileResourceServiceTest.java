package com.project.platform.service;

import com.project.platform.dto.request.CreateResourceLinkRequest;
import com.project.platform.dto.response.FileResourceResponse;
import com.project.platform.entity.FileResource;
import com.project.platform.entity.Project;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.FileResourceType;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.FileResourceRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.impl.FileResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileResourceServiceTest {

    @Mock
    private FileResourceRepository fileResourceRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectProgressService projectProgressService;

    @InjectMocks
    private FileResourceServiceImpl fileResourceService;

    @TempDir
    Path tempDir;

    private Project project;
    private User uploader;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileResourceService, "uploadDir", tempDir.toString());
        fileResourceService.init();

        project = Project.builder()
                .id(1L)
                .title("Smart Traffic Optimization")
                .status(ProjectStatus.IN_PROGRESS)
                .build();

        uploader = User.builder()
                .id(15L)
                .name("Karthik Raja")
                .email("karthik@college.edu")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    @DisplayName("Upload multipart file stores file on disk, creates entity, and triggers project activity")
    void testUploadFile() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(15L)).thenReturn(Optional.of(uploader));

        MockMultipartFile file = new MockMultipartFile(
                "file", "architecture_diagram.png", "image/png", "fake image bytes".getBytes()
        );

        FileResource saved = FileResource.builder()
                .id(501L)
                .projectId(1L)
                .uploadedBy(15L)
                .fileName("architecture_diagram.png")
                .fileType("image/png")
                .fileSize(16L)
                .fileUrl("/api/files/download/501")
                .resourceType(FileResourceType.DIAGRAM)
                .description("System architecture overview")
                .createdAt(LocalDateTime.now())
                .build();

        when(fileResourceRepository.save(any(FileResource.class))).thenReturn(saved);

        FileResourceResponse response = fileResourceService.uploadFile(
                1L, file, "System architecture overview", FileResourceType.DIAGRAM, 15L
        );

        assertNotNull(response);
        assertEquals(501L, response.id());
        assertEquals("architecture_diagram.png", response.fileName());
        assertEquals(FileResourceType.DIAGRAM, response.resourceType());
        assertEquals("Karthik Raja", response.uploaderName());
        verify(projectProgressService, times(1)).recordProjectActivity(1L);
    }

    @Test
    @DisplayName("Sharing external resource link stores URL and sets LINK resource type")
    void testAddResourceLink() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(15L)).thenReturn(Optional.of(uploader));

        FileResource saved = FileResource.builder()
                .id(502L)
                .projectId(1L)
                .uploadedBy(15L)
                .fileName("Figma Prototype")
                .fileType("link/external")
                .fileUrl("https://figma.com/file/sample123")
                .resourceType(FileResourceType.LINK)
                .description("Mobile app wireframes")
                .createdAt(LocalDateTime.now())
                .build();

        when(fileResourceRepository.save(any(FileResource.class))).thenReturn(saved);

        CreateResourceLinkRequest req = new CreateResourceLinkRequest(
                1L, "Figma Prototype", "https://figma.com/file/sample123", "Mobile app wireframes", FileResourceType.LINK
        );

        FileResourceResponse response = fileResourceService.addResourceLink(req, 15L);

        assertNotNull(response);
        assertEquals(502L, response.id());
        assertEquals("https://figma.com/file/sample123", response.fileUrl());
        assertEquals(FileResourceType.LINK, response.resourceType());
        verify(projectProgressService, times(1)).recordProjectActivity(1L);
    }

    @Test
    @DisplayName("Get project resources lists all files and shared links")
    void testGetProjectResources() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(15L)).thenReturn(Optional.of(uploader));

        FileResource r1 = FileResource.builder()
                .id(1L).projectId(1L).uploadedBy(15L).fileName("report.pdf").fileType("application/pdf")
                .resourceType(FileResourceType.DOCUMENT).createdAt(LocalDateTime.now()).build();

        when(fileResourceRepository.findByProjectIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(r1));

        List<FileResourceResponse> list = fileResourceService.getProjectResources(1L);

        assertEquals(1, list.size());
        assertEquals("report.pdf", list.get(0).fileName());
        assertEquals("Karthik Raja", list.get(0).uploaderName());
    }
}
