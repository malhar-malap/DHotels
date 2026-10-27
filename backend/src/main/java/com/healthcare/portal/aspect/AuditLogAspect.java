package com.healthcare.portal.aspect;

import com.healthcare.portal.annotation.LogActivity;
import com.healthcare.portal.entity.AuditLog;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.repository.UserRepository;
import com.healthcare.portal.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Aspect
@Component
public class AuditLogAspect {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    @Around("@annotation(logActivity)")
    public Object logActivity(ProceedingJoinPoint joinPoint, LogActivity logActivity) throws Throwable {
        String targetName = null;
        Long entityId = null;

        // Extract entityId if first argument is Long
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof Long) {
            entityId = (Long) args[0];
            if ("User".equals(logActivity.entityType())) {
                Optional<User> targetUser = userRepository.findById(entityId);
                if (targetUser.isPresent()) {
                    targetName = targetUser.get().getFullName();
                }
            }
        }

        // Execute the method
        Object result = joinPoint.proceed();

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return result;
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return result;
            }
            User actor = userOpt.get();
            Long userId = actor.getId();
            String actorName = actor.getFullName();

            // If actor is the same as target, empty the targetName as requested
            if (targetName != null && targetName.equals(actorName)) {
                targetName = null;
            }

            // Extract reason argument if present (any String argument after the first one)
            String reason = null;
            for (int i = 1; i < args.length; i++) {
                if (args[i] instanceof String) {
                    String strArg = (String) args[i];
                    if (strArg.length() < 255) {
                        reason = strArg;
                        break;
                    }
                }
            }

            AuditLog log = new AuditLog();
            log.setUserId(userId);
            log.setActorName(actorName);
            log.setAction(logActivity.action());
            log.setEntityType(logActivity.entityType());
            log.setEntityId(entityId);
            log.setTargetName(targetName);
            if (reason != null && !reason.trim().isEmpty()) {
                log.setDetails("Reason: " + reason);
            } else {
                log.setDetails("Method: " + joinPoint.getSignature().getName());
            }

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            if (request != null) {
                String ipAddress = request.getHeader("X-Forwarded-For");
                if (ipAddress == null || ipAddress.isEmpty()) {
                    ipAddress = request.getRemoteAddr();
                }
                log.setIpAddress(ipAddress);
            }

            auditLogService.saveLogAsync(log);

        } catch (Exception e) {
            System.err.println("Error in AuditLogAspect: " + e.getMessage());
        }

        return result;
    }
}
