package com.healthcare.portal.service;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.Map;

/**
 * Service class for Contact Message operations
 */
@Service
public class ContactMessageService {
    
    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    @Autowired
    public ContactMessageService(ContactMessageRepository contactMessageRepository, EmailService emailService) {
        this.contactMessageRepository = contactMessageRepository;
        this.emailService = emailService;
    }
    
    @Transactional
    public ContactMessageDTO.ContactMessageResponse submitContactMessage(ContactMessageDTO.ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setPhone(request.getPhone());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setStatus(ContactMessage.ContactMessageStatus.NEW);
        
        message = contactMessageRepository.save(message);
        
        // Send email notification to admin (non-blocking, don't fail if email fails)
        try {
            emailService.sendContactMessageNotification(
                "d@dhacquisitions.co",
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getSubject(),
                request.getMessage()
            );
        } catch (Exception e) {
            // Log but don't fail - message is already saved
        }
        
        return mapToResponse(message);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<ContactMessageDTO.ContactMessageResponse> getAllMessages(
            int page, int size, String status, String duration, String sortBy, String keyword) {
        
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && "oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ContactMessage.ContactMessageStatus messageStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            try {
                messageStatus = ContactMessage.ContactMessageStatus.valueOf(status.toUpperCase());
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
        
        Page<ContactMessage> messages = contactMessageRepository.searchMessages(
                messageStatus, startDate, searchKeyword, pageable);
        
        Page<ContactMessageDTO.ContactMessageResponse> responsePage = messages.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public void markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        
        message.setStatus(ContactMessage.ContactMessageStatus.READ);
        contactMessageRepository.save(message);
    }
    
    @Transactional
    public void deleteMessage(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new RuntimeException("Contact message not found");
        }
        contactMessageRepository.deleteById(id);
    }
    
    @Transactional
    public void replyToMessage(Long id, String replyContent) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        
        message.setStatus(ContactMessage.ContactMessageStatus.REPLIED);
        message.setRepliedAt(java.time.LocalDateTime.now());
        contactMessageRepository.save(message);
        
        // Send reply email to the user
        try {
            emailService.sendContactReplyEmail(
                message.getEmail(),
                message.getName(),
                message.getSubject(),
                message.getMessage(),
                replyContent
            );
        } catch (Exception e) {
            // Log but don't fail - status is already updated
        }
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getMessageStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMessages", contactMessageRepository.count());
        stats.put("newMessages", contactMessageRepository.countByStatus(ContactMessage.ContactMessageStatus.NEW));
        stats.put("readMessages", contactMessageRepository.countByStatus(ContactMessage.ContactMessageStatus.READ));
        stats.put("repliedMessages", contactMessageRepository.countByStatus(ContactMessage.ContactMessageStatus.REPLIED));
        return stats;
    }
    
    private ContactMessageDTO.ContactMessageResponse mapToResponse(ContactMessage msg) {
        ContactMessageDTO.ContactMessageResponse response = new ContactMessageDTO.ContactMessageResponse();
        response.setId(msg.getId());
        response.setName(msg.getName());
        response.setEmail(msg.getEmail());
        response.setPhone(msg.getPhone());
        response.setSubject(msg.getSubject());
        response.setMessage(msg.getMessage());
        response.setStatus(msg.getStatus().name());
        response.setCreatedAt(msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);
        response.setRepliedAt(msg.getRepliedAt() != null ? msg.getRepliedAt().toString() : null);
        return response;
    }
}
