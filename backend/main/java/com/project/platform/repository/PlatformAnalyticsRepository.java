package com.project.platform.repository;

import com.project.platform.entity.PlatformAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlatformAnalyticsRepository extends JpaRepository<PlatformAnalytics, Long> {
    Optional<PlatformAnalytics> findTopByOrderByGeneratedAtDesc();
}
