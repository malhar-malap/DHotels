package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.service.ContactMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contact Controller
 * Handles public contact form submissions
 */
@RestController
@RequestMapping("/contact")
@Tag(name = "Contact", description = "Contact message APIs")
public class ContactController {
    
    private final ContactMessageService contactMessageService;

    public ContactController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }
    
    @PostMapping("/submit")
    @Operation(summary = "Submit contact message", description = "Submits a new contact message from the website contact form")
    public ResponseEntity<ApiResponse<ContactMessageDTO.ContactMessageResponse>> submitContactMessage(
            @Valid @RequestBody ContactMessageDTO.ContactMessageRequest request) {
        ContactMessageDTO.ContactMessageResponse response = contactMessageService.submitContactMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Contact message submitted successfully", response));
    }
}
