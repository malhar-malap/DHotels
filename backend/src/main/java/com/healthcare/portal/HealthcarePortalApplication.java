package com.healthcare.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Class for Healthcare Portal
 * DH Acquisitions Marketplace - OLX x LinkedIn for Healthcare
 * 
 * @author Healthcare Portal Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class HealthcarePortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthcarePortalApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner updateDbSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE jobs MODIFY COLUMN city_id BIGINT NULL;");
                System.out.println("====== DB SCHEMA UPDATED: city_id is now NULLABLE ======");
                jdbcTemplate.execute("ALTER TABLE jobs MODIFY COLUMN experience_required VARCHAR(20) NOT NULL;");
                System.out.println("====== DB SCHEMA UPDATED: experience_required is now VARCHAR(20) ======");
            } catch (Exception e) {
                System.out.println("====== DB SCHEMA UPDATE FAILED or ALREADY APPLIED ====== " + e.getMessage());
            }
        };
    }
}
