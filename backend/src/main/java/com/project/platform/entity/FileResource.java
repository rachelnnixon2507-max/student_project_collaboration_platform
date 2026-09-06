package com.project.platform.entity;

import com.project.platform.entity.enums.FileResourceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * FileResource entity representing files and external resources shared within a project.
 * OWNED by Member 2 - Team Collaboration.
 */
@Entity
@Table(name = "file_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    /** External link URL or download path */
    @Column(name = "file_url", length = 1000)
    private String fileUrl;

    /** Relative or absolute storage path on the server disk for uploaded files */
    @Column(name = "storage_path", length = 1000)
    private String storagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    @Builder.Default
    private FileResourceType resourceType = FileResourceType.DOCUMENT;

    @Column(length = 1000)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.resourceType == null) {
            this.resourceType = FileResourceType.DOCUMENT;
        }
    }
}
