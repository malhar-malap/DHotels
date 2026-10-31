package com.healthcare.portal.service;

import com.healthcare.portal.dto.MandateDTO;
import com.healthcare.portal.dto.PageResponse;
import com.healthcare.portal.entity.MandateSubmission;
import com.healthcare.portal.repository.MandateSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class MandateService {

    private final MandateSubmissionRepository repository;
    private final EmailService emailService;

    @Value("${app.notification-email}")
    private String notificationEmail;

    @Autowired
    public MandateService(MandateSubmissionRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @Transactional
    public MandateDTO.MandateResponse submitMandate(MandateDTO.MandateRequest request) {
        MandateSubmission entity = new MandateSubmission();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPhone(request.getPhone());
        entity.setObjectives(request.getObjectives());
        entity.setStatus(MandateSubmission.MandateStatus.NEW);

        entity = repository.save(entity);

        emailService.sendMandateNotification(
                notificationEmail,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getObjectives()
        );

        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public PageResponse<MandateDTO.MandateResponse> getAllMandates(
            int page, int size, String status, String duration, String sortBy, String keyword) {
        
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && "oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }
        
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        MandateSubmission.MandateStatus enumStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            try {
                enumStatus = MandateSubmission.MandateStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        
        java.time.LocalDateTime startDate = null;
        if (duration != null && !duration.isEmpty()) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if ("today".equalsIgnoreCase(duration)) {
                startDate = now.toLocalDate().atStartOfDay();
            } else if ("week".equalsIgnoreCase(duration)) {
                startDate = now.minusDays(7);
            } else if ("month".equalsIgnoreCase(duration)) {
                startDate = now.minusMonths(1);
            } else if ("quarter".equalsIgnoreCase(duration)) {
                startDate = now.minusMonths(3);
            }
        }
        
        String searchKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            searchKeyword = keyword.trim();
        }
        
        Page<MandateSubmission> entityPage = repository.searchMandates(
                enumStatus, startDate, searchKeyword, pageRequest);
        
        return PageResponse.from(entityPage.map(this::mapToResponse));
    }

    @Transactional
    public void updateMandateStatus(Long id, String status, String adminNotes) {
        MandateSubmission entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mandate not found"));
        
        if (status != null && !status.isEmpty()) {
            entity.setStatus(MandateSubmission.MandateStatus.valueOf(status.toUpperCase()));
        }
        
        if (adminNotes != null) {
            entity.setAdminNotes(adminNotes);
        }
        
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMandateStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMandates", repository.count());
        stats.put("newMandates", repository.countByStatus(MandateSubmission.MandateStatus.NEW));
        stats.put("inReviewMandates", repository.countByStatus(MandateSubmission.MandateStatus.IN_REVIEW));
        stats.put("resolvedMandates", repository.countByStatus(MandateSubmission.MandateStatus.RESOLVED));
        return stats;
    }

    private MandateDTO.MandateResponse mapToResponse(MandateSubmission entity) {
        MandateDTO.MandateResponse response = new MandateDTO.MandateResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        response.setObjectives(entity.getObjectives());
        response.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        response.setAdminNotes(entity.getAdminNotes());
        
        if (entity.getCreatedAt() != null) {
            response.setCreatedAt(entity.getCreatedAt().toString());
        }
        if (entity.getUpdatedAt() != null) {
            response.setUpdatedAt(entity.getUpdatedAt().toString());
        }
        
        return response;
    }
}
