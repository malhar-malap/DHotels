package com.healthcare.portal.config;

import com.healthcare.portal.repository.BuyerVerificationRepository;
import com.healthcare.portal.repository.JobApplicationRepository;
import com.healthcare.portal.repository.UserCVRepository;
import com.healthcare.portal.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * One-time, idempotent move of CVs and KYC documents uploaded before private storage existed:
 * the file goes from uploads/ to uploads/private/ and its URL is rewritten to the
 * access-checked /api/files/private/ endpoint. Rows already migrated are skipped.
 */
@Component
public class PrivateDocumentMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PrivateDocumentMigration.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final UserCVRepository userCVRepository;
    private final BuyerVerificationRepository buyerVerificationRepository;
    private final Path uploadDir;

    public PrivateDocumentMigration(JobApplicationRepository jobApplicationRepository, UserCVRepository userCVRepository,
                                    BuyerVerificationRepository buyerVerificationRepository,
                                    @Value("${file.upload-dir:uploads}") String uploadDir) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.userCVRepository = userCVRepository;
        this.buyerVerificationRepository = buyerVerificationRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int[] moved = {0};
        jobApplicationRepository.findAll().forEach(a -> migrate(a::getCvUrl, a::setCvUrl, moved));
        userCVRepository.findAll().forEach(cv -> migrate(cv::getCvUrl, cv::setCvUrl, moved));
        buyerVerificationRepository.findAll().forEach(v -> migrate(v::getDocUrl, v::setDocUrl, moved));
        if (moved[0] > 0) {
            log.info("Moved {} existing CV/KYC document(s) to private storage", moved[0]);
        }
    }

    private void migrate(Supplier<String> getter, Consumer<String> setter, int[] moved) {
        String url = getter.get();
        if (url == null || url.startsWith(FileStorageService.PRIVATE_URL_PREFIX)) {
            return;
        }
        String name = url.substring(url.lastIndexOf('/') + 1);
        if (!FileStorageService.isStoredName(name)) {
            return;
        }
        Path publicFile = uploadDir.resolve(name);
        Path privateFile = uploadDir.resolve("private").resolve(name);
        try {
            if (Files.isRegularFile(publicFile)) {
                Files.createDirectories(privateFile.getParent());
                Files.move(publicFile, privateFile, StandardCopyOption.REPLACE_EXISTING);
            }
            if (Files.isRegularFile(privateFile)) {
                setter.accept(FileStorageService.PRIVATE_URL_PREFIX + name);
                moved[0]++;
            }
        } catch (IOException e) {
            log.warn("Could not move document {} to private storage: {}", name, e.getMessage());
        }
    }
}
