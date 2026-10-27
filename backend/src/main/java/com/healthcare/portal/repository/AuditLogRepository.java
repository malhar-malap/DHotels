package com.healthcare.portal.repository;

import com.healthcare.portal.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);
    Page<AuditLog> findByActionContainingIgnoreCase(String action, Pageable pageable);
    Page<AuditLog> findByUserIdAndActionContainingIgnoreCase(Long userId, String action, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a WHERE " +
           "(:user IS NULL OR :user = '' OR " +
           "  (a.actorName IS NOT NULL AND LOWER(a.actorName) LIKE LOWER(CONCAT('%', :user, '%'))) OR " +
           "  (CAST(a.userId AS string) = :user)) AND " +
           "(:action IS NULL OR :action = '' OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
           "(:fromDate IS NULL OR a.timestamp >= :fromDate) AND " +
           "(:toDate IS NULL OR a.timestamp <= :toDate)")
    Page<AuditLog> searchAuditLogs(@org.springframework.data.repository.query.Param("user") String user,
                                   @org.springframework.data.repository.query.Param("action") String action,
                                   @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate,
                                   @org.springframework.data.repository.query.Param("toDate") java.time.LocalDateTime toDate,
                                   Pageable pageable);
}
