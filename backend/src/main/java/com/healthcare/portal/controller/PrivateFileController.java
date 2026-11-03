package com.healthcare.portal.controller;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.repository.BuyerVerificationRepository;
import com.healthcare.portal.repository.JobApplicationRepository;
import com.healthcare.portal.repository.UserCVRepository;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.FileStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;

/**
 * Serves private documents (CVs, KYC proofs) only to people allowed to see them:
 * admins, the uploader, and for CVs the employer of the job applied to.
 */
@RestController
@RequestMapping("/files/private")
public class PrivateFileController {

    private final FileStorageService fileStorageService;
    private final AuthService authService;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserCVRepository userCVRepository;
    private final BuyerVerificationRepository buyerVerificationRepository;

    public PrivateFileController(FileStorageService fileStorageService, AuthService authService,
                                 JobApplicationRepository jobApplicationRepository, UserCVRepository userCVRepository,
                                 BuyerVerificationRepository buyerVerificationRepository) {
        this.fileStorageService = fileStorageService;
        this.authService = authService;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userCVRepository = userCVRepository;
        this.buyerVerificationRepository = buyerVerificationRepository;
    }

    @GetMapping("/{fileName}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> download(@PathVariable String fileName) {
        if (!FileStorageService.isStoredName(fileName)) {
            return ResponseEntity.notFound().build();
        }
        User viewer = authService.getCurrentUserEntity();
        if (!canAccess(viewer, fileName)) {
            // Same answer as a missing file, so names can't be probed
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Path path = fileStorageService.resolvePrivateDocument(fileName);
        if (path == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(FileStorageService.contentTypeFor(fileName)))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'")
                .body(new FileSystemResource(path));
    }

    private boolean canAccess(User viewer, String fileName) {
        if (viewer.isAdmin()) {
            return true;
        }
        String suffix = "/" + fileName;
        Long viewerId = viewer.getId();
        boolean applicationAccess = jobApplicationRepository.findByCvUrlEndingWith(suffix).stream()
                .anyMatch(app -> viewerId.equals(app.getSeeker().getId())
                        || viewerId.equals(app.getJob().getEmployer().getId()));
        if (applicationAccess) {
            return true;
        }
        boolean ownCv = userCVRepository.findByCvUrlEndingWith(suffix).stream()
                .anyMatch(cv -> viewerId.equals(cv.getUser().getId()));
        if (ownCv) {
            return true;
        }
        return buyerVerificationRepository.findByDocUrlEndingWith(suffix).stream()
                .anyMatch(v -> viewerId.equals(v.getUser().getId()));
    }
}
