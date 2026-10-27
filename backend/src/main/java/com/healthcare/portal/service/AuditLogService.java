package com.healthcare.portal.service;

import com.healthcare.portal.entity.AuditLog;
import com.healthcare.portal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Saves an audit log asynchronously to avoid blocking the main request thread.
     */
    public void saveLogAsync(AuditLog log) {
        CompletableFuture.runAsync(() -> {
            try {
                auditLogRepository.save(log);
            } catch (Exception e) {
                // Ignore audit log save errors to prevent interrupting user flow,
                // but log to standard error/logger
                System.err.println("Failed to save audit log: " + e.getMessage());
            }
        });
    }

    public Page<AuditLog> getAuditLogs(String user, String action, String fromDate, String toDate, Pageable pageable) {
        java.time.LocalDateTime start = null;
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            try {
                start = java.time.LocalDate.parse(fromDate.trim()).atStartOfDay();
            } catch (Exception ignored) {}
        }

        java.time.LocalDateTime end = null;
        if (toDate != null && !toDate.trim().isEmpty()) {
            try {
                end = java.time.LocalDate.parse(toDate.trim()).atTime(23, 59, 59, 999999999);
            } catch (Exception ignored) {}
        }

        return auditLogRepository.searchAuditLogs(user, action, start, end, pageable);
    }
}
