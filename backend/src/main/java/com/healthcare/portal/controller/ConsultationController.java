package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/consultations")
@Tag(name = "Consultations", description = "Schedule a Call APIs")
public class ConsultationController {
    
    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }
    
    @PostMapping("/schedule")
    @Operation(summary = "Schedule a call", description = "Submits a new consultation/call request")
    public ResponseEntity<ApiResponse<ConsultationDTO.ConsultationResponse>> scheduleCall(
            @Valid @RequestBody ConsultationDTO.ConsultationRequest request) {
        ConsultationDTO.ConsultationResponse response = consultationService.submitConsultation(request);
        return ResponseEntity.ok(ApiResponse.success("Call scheduled successfully. Our team will get back to you shortly.", response));
    }
}
