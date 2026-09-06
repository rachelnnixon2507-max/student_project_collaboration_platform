package com.project.platform.repository;

import com.project.platform.entity.PlatformAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformAnalyticsRepository extends JpaRepository<PlatformAnalytics, Long> {

    Optional<PlatformAnalytics> findTopByOrderByGeneratedAtDesc();
}
