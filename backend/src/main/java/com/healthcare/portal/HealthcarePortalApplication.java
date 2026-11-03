package com.healthcare.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Class for Healthcare Portal
 * DHotels24.in - hospitality property marketplace
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
            try {
                // The MySQL ENUM column rejects new job types; a VARCHAR lets EmploymentType grow.
                // LOCUM (a medical term inherited from DHAcquisitions) became TEMPORARY.
                jdbcTemplate.execute("ALTER TABLE jobs MODIFY COLUMN employment_type VARCHAR(20) NOT NULL;");
                int renamed = jdbcTemplate.update("UPDATE jobs SET employment_type = 'TEMPORARY' WHERE employment_type = 'LOCUM'");
                System.out.println("====== DB SCHEMA UPDATED: jobs.employment_type is now VARCHAR(20); LOCUM -> TEMPORARY: " + renamed + " ======");
            } catch (Exception e) {
                System.out.println("====== DB SCHEMA UPDATE FAILED or ALREADY APPLIED ====== " + e.getMessage());
            }
            try {
                // ddl-auto=update never relaxes NOT NULL, and "price not disclosed" listings store no price
                jdbcTemplate.execute("ALTER TABLE listings MODIFY COLUMN asking_price DECIMAL(15,2) NULL;");
                System.out.println("====== DB SCHEMA UPDATED: listings.asking_price is now NULLABLE ======");
            } catch (Exception e) {
                System.out.println("====== DB SCHEMA UPDATE FAILED or ALREADY APPLIED ====== " + e.getMessage());
            }
        };
    }
}
