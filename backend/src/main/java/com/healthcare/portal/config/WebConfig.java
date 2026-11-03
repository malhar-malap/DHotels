package com.healthcare.portal.config;

import com.healthcare.portal.service.FileStorageService;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString() + "/");
    }

    /**
     * Only top-level images are public under /uploads/. Documents and the private/ folder are
     * served by PrivateFileController instead, and the sandbox CSP stops any uploaded content
     * from running scripts on our origin.
     */
    @Bean
    public FilterRegistrationBean<Filter> publicUploadsFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter((req, res, chain) -> {
            HttpServletRequest request = (HttpServletRequest) req;
            HttpServletResponse response = (HttpServletResponse) res;
            String path = request.getRequestURI().substring(request.getContextPath().length());
            String name = path.substring("/uploads/".length());
            if (!FileStorageService.isStoredName(name)
                    || !FileStorageService.IMAGE_EXTENSIONS.contains(FileStorageService.extensionOf(name))) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self'");
            chain.doFilter(req, res);
        });
        registration.addUrlPatterns("/uploads/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
