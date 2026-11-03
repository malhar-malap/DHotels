package com.healthcare.portal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Stores uploads under file.upload-dir.
 * Images live at the top level and are served publicly from /uploads/.
 * Private documents (CVs, ID proofs) live in the private/ subfolder and are only served
 * through PrivateFileController after an access check.
 */
@Service
public class FileStorageService {

    public static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    public static final Set<String> DOCUMENT_EXTENSIONS = Set.of("pdf", "doc", "docx", "jpg", "jpeg", "png", "webp");
    public static final String PRIVATE_URL_PREFIX = "/api/files/private/";

    /** Generated names only: a UUID plus an allowed extension. Anything else is rejected. */
    private static final Pattern STORED_NAME = Pattern.compile("[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.[a-z]{3,4}");

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png", "webp", "image/webp", "gif", "image/gif",
            "pdf", "application/pdf", "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final Path fileStorageLocation;
    private final Path privateStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        // Inside the upload dir so it lives on the same persisted Docker volume
        this.privateStorageLocation = this.fileStorageLocation.resolve("private");

        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.privateStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /** Stores a public image (listing photos). Returns the generated file name. */
    public String storeImage(MultipartFile file) {
        return store(file, IMAGE_EXTENSIONS, fileStorageLocation);
    }

    /** Stores a private document (CV, ID proof). Returns the URL to fetch it through the access-checked endpoint. */
    public String storePrivateDocument(MultipartFile file) {
        return PRIVATE_URL_PREFIX + store(file, DOCUMENT_EXTENSIONS, privateStorageLocation);
    }

    /**
     * Resolves a private document by its stored name. Older documents were saved in the public
     * folder before private storage existed, so that location is checked too.
     */
    public Path resolvePrivateDocument(String fileName) {
        if (!isStoredName(fileName)) {
            return null;
        }
        for (Path dir : new Path[]{privateStorageLocation, fileStorageLocation}) {
            Path candidate = dir.resolve(fileName).normalize();
            if (candidate.startsWith(dir) && Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    public static boolean isStoredName(String fileName) {
        return fileName != null && STORED_NAME.matcher(fileName).matches();
    }

    public static String extensionOf(String fileName) {
        int dot = fileName == null ? -1 : fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public static String contentTypeFor(String fileName) {
        return CONTENT_TYPES.getOrDefault(extensionOf(fileName), "application/octet-stream");
    }

    private String store(MultipartFile file, Set<String> allowedExtensions, Path targetDir) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please choose a file to upload");
        }
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = extensionOf(originalFileName);
        if (!allowedExtensions.contains(extension)) {
            throw new RuntimeException("Unsupported file type. Allowed: " + String.join(", ", allowedExtensions.stream().sorted().toList()));
        }

        try {
            if (!contentMatchesExtension(file, extension)) {
                throw new RuntimeException("The file's contents don't match its ." + extension + " extension");
            }
            // The stored name is generated, never taken from the user
            String fileName = UUID.randomUUID() + "." + extension;
            Path targetLocation = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    /** Checks the file's leading bytes so e.g. an HTML page can't be uploaded renamed to .png. */
    static boolean contentMatchesExtension(MultipartFile file, String extension) throws IOException {
        byte[] head = new byte[12];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(head, 0, head.length);
        }
        head = Arrays.copyOf(head, read);
        switch (extension) {
            case "jpg":
            case "jpeg":
                return startsWith(head, 0xFF, 0xD8, 0xFF);
            case "png":
                return startsWith(head, 0x89, 'P', 'N', 'G');
            case "gif":
                return startsWith(head, 'G', 'I', 'F', '8');
            case "webp":
                return startsWith(head, 'R', 'I', 'F', 'F') && head.length >= 12
                        && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P';
            case "pdf":
                return startsWith(head, '%', 'P', 'D', 'F');
            case "doc":
                return startsWith(head, 0xD0, 0xCF, 0x11, 0xE0);
            case "docx":
                return startsWith(head, 'P', 'K', 0x03, 0x04);
            default:
                return false;
        }
    }

    private static boolean startsWith(byte[] data, int... expected) {
        if (data.length < expected.length) return false;
        for (int i = 0; i < expected.length; i++) {
            if ((data[i] & 0xFF) != expected[i]) return false;
        }
        return true;
    }
}
