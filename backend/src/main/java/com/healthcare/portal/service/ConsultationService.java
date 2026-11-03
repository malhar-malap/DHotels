package com.healthcare.portal.service;

import com.healthcare.portal.dto.ConsultationDTO;
import com.healthcare.portal.dto.PageResponse;
import com.healthcare.portal.entity.ConsultationRequest;
import com.healthcare.portal.repository.ConsultationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class ConsultationService {

    private final ConsultationRequestRepository repository;
    private final EmailService emailService;
    private final NotificationService notificationService;


    @Value("${app.notification-email}")
    private String notificationEmail;

    @Autowired
    public ConsultationService(ConsultationRequestRepository repository, EmailService emailService, NotificationService notificationService) {
        this.notificationService = notificationService;
        this.repository = repository;
        this.emailService = emailService;
    }

    @Transactional
    public ConsultationDTO.ConsultationResponse submitConsultation(ConsultationDTO.ConsultationRequest request) {
        ConsultationRequest entity = new ConsultationRequest();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPhone(request.getPhone());
        
        if (request.getPreferredDate() != null && !request.getPreferredDate().isEmpty()) {
            entity.setPreferredDate(LocalDate.parse(request.getPreferredDate()));
        }
        
        entity.setTimeSlot(request.getTimeSlot());
        entity.setTopic(request.getTopic());
        entity.setStatus(ConsultationRequest.ConsultationStatus.PENDING_CALL);

        entity = repository.save(entity);

        notificationService.notifyAdmins(NotificationService.ADMIN_ALERT, "New call request",
                request.getName() + " requested a consultation call.", "/admin/consultations");
        emailService.sendConsultationNotification(
                notificationEmail,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPreferredDate(),
                request.getTimeSlot(),
                request.getTopic()
        );

        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConsultationDTO.ConsultationResponse> getAllConsultations(
            int page, int size, String status, String duration, String sortBy, String keyword) {
        
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && "oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }
        
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        ConsultationRequest.ConsultationStatus enumStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            try {
                enumStatus = ConsultationRequest.ConsultationStatus.valueOf(status.toUpperCase());
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
        
        Page<ConsultationRequest> entityPage = repository.searchConsultations(
                enumStatus, startDate, searchKeyword, pageRequest);
        
        return PageResponse.from(entityPage.map(this::mapToResponse));
    }

    @Transactional
    public void updateConsultationStatus(Long id, String status, String adminNotes) {
        ConsultationRequest entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
        
        if (status != null && !status.isEmpty()) {
            entity.setStatus(ConsultationRequest.ConsultationStatus.valueOf(status.toUpperCase()));
        }
        
        if (adminNotes != null) {
            entity.setAdminNotes(adminNotes);
        }
        
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConsultationStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalConsultations", repository.count());
        stats.put("pendingConsultations", repository.countByStatus(ConsultationRequest.ConsultationStatus.PENDING_CALL));
        stats.put("scheduledConsultations", repository.countByStatus(ConsultationRequest.ConsultationStatus.SCHEDULED));
        stats.put("completedConsultations", repository.countByStatus(ConsultationRequest.ConsultationStatus.COMPLETED));
        return stats;
    }

    private ConsultationDTO.ConsultationResponse mapToResponse(ConsultationRequest entity) {
        ConsultationDTO.ConsultationResponse response = new ConsultationDTO.ConsultationResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        
        if (entity.getPreferredDate() != null) {
            response.setPreferredDate(entity.getPreferredDate().toString());
        }
        
        response.setTimeSlot(entity.getTimeSlot());
        response.setTopic(entity.getTopic());
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
