package com.healthcare.portal.dto;

/**
 * Generic API Response wrapper
 */
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Long timestamp;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data, Long timestamp) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data, System.currentTimeMillis());
    }
}
