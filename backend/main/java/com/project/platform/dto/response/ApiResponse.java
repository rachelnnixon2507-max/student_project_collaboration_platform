package com.project.platform.dto.response;

/** Generic response wrapper kept consistent across the whole API (Team Rule #26). */
public record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "success", data);
    }
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
}
