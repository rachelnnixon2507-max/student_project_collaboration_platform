package com.project.platform.repository;

import com.project.platform.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    Page<StudentProfile> findBySkillsContainingIgnoreCase(String skill, Pageable pageable);
    Page<StudentProfile> findByDepartmentIgnoreCase(String department, Pageable pageable);
    Page<StudentProfile> findByDepartmentIgnoreCaseAndSkillsContainingIgnoreCase(String department, String skill, Pageable pageable);
}
