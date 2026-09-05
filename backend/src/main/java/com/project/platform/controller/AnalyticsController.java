package com.project.platform.controller;

import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.PlatformAnalyticsResponse;
import com.project.platform.service.PlatformAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Feature 4: Platform Analytics. ADMIN-only. */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final PlatformAnalyticsService platformAnalyticsService;

    /** Always-current dashboard, computed on demand. */
    @GetMapping("/live")
    public ApiResponse<PlatformAnalyticsResponse> getLive() {
        return ApiResponse.ok(platformAnalyticsService.getLiveSummary());
    }

    /** Persists a snapshot for historical trend tracking. */
    @PostMapping("/snapshot")
    public ApiResponse<PlatformAnalyticsResponse> generateSnapshot() {
        return ApiResponse.ok("Snapshot generated", platformAnalyticsService.generateAndSaveSnapshot());
    }

    @GetMapping("/snapshot/latest")
    public ApiResponse<PlatformAnalyticsResponse> getLatestSnapshot() {
        return ApiResponse.ok(platformAnalyticsService.getLatestSnapshot());
    }
}
