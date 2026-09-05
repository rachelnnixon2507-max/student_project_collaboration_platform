package com.project.platform.service;

import com.project.platform.dto.response.PlatformAnalyticsResponse;

/** Feature 4: Platform Analytics. */
public interface PlatformAnalyticsService {

    /** Computed live, directly from the current data — always up to date. */
    PlatformAnalyticsResponse getLiveSummary();

    /** Persists a snapshot of the current live summary for historical tracking. */
    PlatformAnalyticsResponse generateAndSaveSnapshot();

    /** Returns the most recently saved snapshot, if any. */
    PlatformAnalyticsResponse getLatestSnapshot();
}
