package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.service.MandateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mandates")
@Tag(name = "Mandates", description = "Submit Your Mandate APIs")
public class MandateController {
    
    private final MandateService mandateService;

    public MandateController(MandateService mandateService) {
        this.mandateService = mandateService;
    }
    
    @PostMapping("/submit")
    @Operation(summary = "Submit a mandate", description = "Submits a new strategic mandate")
    public ResponseEntity<ApiResponse<MandateDTO.MandateResponse>> submitMandate(
            @Valid @RequestBody MandateDTO.MandateRequest request) {
        MandateDTO.MandateResponse response = mandateService.submitMandate(request);
        return ResponseEntity.ok(ApiResponse.success("Mandate submitted successfully. Our team will review your objectives and reach out.", response));
    }
}
