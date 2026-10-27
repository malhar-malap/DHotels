-- ============================================================
-- Healthcare Portal Database Schema
-- DH Acquisitions Marketplace
-- Database: healthcare_portal
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS healthcare_portal;
USE healthcare_portal;

-- ============================================================
-- MASTER DATA TABLES
-- ============================================================

-- States Table
CREATE TABLE states (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cities Table
CREATE TABLE cities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    state_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    UNIQUE KEY unique_city_state (name, state_id)
);

-- Categories Table (Hospital, Pharma, Diagnostics, Equipment)
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deal Types Table
CREATE TABLE deal_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Job Categories Table
CREATE TABLE job_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types Table
CREATE TABLE equipment_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospital Types Table
CREATE TABLE hospital_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USER MANAGEMENT TABLES
-- ============================================================

-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    company_name VARCHAR(200),
    city_id BIGINT,
    profile_photo_url VARCHAR(500),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_verified_buyer BOOLEAN DEFAULT FALSE,
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
);

-- User Roles Table
CREATE TABLE user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role ENUM('SELLER', 'BUYER', 'EMPLOYER', 'JOB_SEEKER', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
);

-- Buyer Verifications Table
CREATE TABLE buyer_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    doc_type ENUM('AADHAAR', 'PAN', 'PASSPORT') NOT NULL,
    doc_url VARCHAR(500) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- MARKETPLACE TABLES
-- ============================================================

-- Listings Table (Main table for all listing types)
CREATE TABLE listings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    deal_type_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(500),
    detailed_description TEXT,
    city_id BIGINT NULL,
    city_name VARCHAR(100),
    address TEXT,
    asking_price DECIMAL(15, 2) NOT NULL,
    price_negotiable BOOLEAN DEFAULT TRUE,
    is_confidential BOOLEAN DEFAULT FALSE,
    confidential_title VARCHAR(200),
    status ENUM('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED', 'SOLD', 'WITHDRAWN') DEFAULT 'PENDING',
    rejection_reason TEXT,
    view_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (deal_type_id) REFERENCES deal_types(id),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
);

-- Listing Images Table
CREATE TABLE listing_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Hospital Details Table (1-to-1 with listings)
CREATE TABLE hospital_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL UNIQUE,
    number_of_beds INT,
    hospital_type_id BIGINT,
    nabh_accredited BOOLEAN DEFAULT FALSE,
    monthly_revenue DECIMAL(15, 2),
    land_area_sqft DECIMAL(10, 2),
    year_established INT,
    opd_daily INT,
    ip_beds_occupied INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_type_id) REFERENCES hospital_types(id)
);

-- Pharma Details Table (1-to-1 with listings)
CREATE TABLE pharma_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL UNIQUE,
    annual_turnover DECIMAL(15, 2),
    stake_percentage DECIMAL(5, 2),
    gmp_certified BOOLEAN DEFAULT FALSE,
    fda_certified BOOLEAN DEFAULT FALSE,
    who_certified BOOLEAN DEFAULT FALSE,
    number_of_skus INT,
    product_types TEXT,
    manufacturing_capacity TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Diagnostic Details Table (1-to-1 with listings)
CREATE TABLE diagnostic_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL UNIQUE,
    diagnostic_type ENUM('PATHOLOGY_LAB', 'XRAY', 'MRI_CT', 'ULTRASOUND', 'MULTI_MODALITY') NOT NULL,
    machines_included TEXT,
    daily_patient_footfall INT,
    nabl_accredited BOOLEAN DEFAULT FALSE,
    tests_offered TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Equipment Details Table (1-to-1 with listings)
CREATE TABLE equipment_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL UNIQUE,
    equipment_type_id BIGINT,
    brand VARCHAR(100),
    model_number VARCHAR(100),
    year_of_manufacture INT,
    condition_rating ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR') NOT NULL,
    warranty_available BOOLEAN DEFAULT FALSE,
    warranty_expiry_date DATE,
    service_history_doc_url VARCHAR(500),
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id)
);

-- Inquiries Table
CREATE TABLE inquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_email VARCHAR(100) NOT NULL,
    buyer_phone VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('NEW', 'READ', 'REPLIED', 'CLOSED') DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- JOB BOARD TABLES
-- ============================================================

-- Jobs Table
CREATE TABLE jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employer_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    job_category_id BIGINT NOT NULL,
    specialisation VARCHAR(100),
    employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'LOCUM') NOT NULL,
    salary_min_lpa DECIMAL(10, 2),
    salary_max_lpa DECIMAL(10, 2),
    city_id BIGINT NOT NULL,
    experience_required ENUM('FRESHER', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS') NOT NULL,
    qualifications VARCHAR(500),
    description TEXT NOT NULL,
    application_deadline DATE NOT NULL,
    number_of_openings INT DEFAULT 1,
    contact_email VARCHAR(100) NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'CLOSED', 'FILLED', 'EXPIRED') DEFAULT 'PENDING',
    view_count INT DEFAULT 0,
    application_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_category_id) REFERENCES job_categories(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Job Applications Table
CREATE TABLE job_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    seeker_id BIGINT NOT NULL,
    cv_url VARCHAR(500) NOT NULL,
    cover_letter TEXT,
    status ENUM('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED') DEFAULT 'SUBMITTED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, seeker_id)
);

-- User CVs Table
CREATE TABLE user_cvs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    cv_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(200),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ADMIN & SYSTEM TABLES
-- ============================================================

-- Admin Audit Log Table
CREATE TABLE admin_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Site Settings Table
CREATE TABLE site_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('NEW', 'READ', 'REPLIED') DEFAULT 'NEW',
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INSERT MASTER DATA
-- ============================================================

-- Insert States
INSERT INTO states (name, code) VALUES
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TS'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK');

-- Insert Major Cities
INSERT INTO cities (name, state_id) VALUES
('Mumbai', (SELECT id FROM states WHERE code = 'MH')),
('Pune', (SELECT id FROM states WHERE code = 'MH')),
('Nagpur', (SELECT id FROM states WHERE code = 'MH')),
('Delhi', (SELECT id FROM states WHERE code = 'DL')),
('Bangalore', (SELECT id FROM states WHERE code = 'KA')),
('Chennai', (SELECT id FROM states WHERE code = 'TN')),
('Hyderabad', (SELECT id FROM states WHERE code = 'TS')),
('Kolkata', (SELECT id FROM states WHERE code = 'WB')),
('Ahmedabad', (SELECT id FROM states WHERE code = 'GJ')),
('Surat', (SELECT id FROM states WHERE code = 'GJ')),
('Jaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Lucknow', (SELECT id FROM states WHERE code = 'UP')),
('Kanpur', (SELECT id FROM states WHERE code = 'UP')),
('Chandigarh', (SELECT id FROM states WHERE code = 'PB')),
('Indore', (SELECT id FROM states WHERE code = 'MP')),
('Bhopal', (SELECT id FROM states WHERE code = 'MP')),
('Coimbatore', (SELECT id FROM states WHERE code = 'TN')),
('Kochi', (SELECT id FROM states WHERE code = 'KL')),
('Thiruvananthapuram', (SELECT id FROM states WHERE code = 'KL')),
('Guwahati', (SELECT id FROM states WHERE code = 'AS')),
('Patna', (SELECT id FROM states WHERE code = 'BR')),
('Ranchi', (SELECT id FROM states WHERE code = 'JH')),
('Bhubaneswar', (SELECT id FROM states WHERE code = 'OD')),
('Amritsar', (SELECT id FROM states WHERE code = 'PB')),
('Varanasi', (SELECT id FROM states WHERE code = 'UP')),
('Agra', (SELECT id FROM states WHERE code = 'UP')),
('Noida', (SELECT id FROM states WHERE code = 'UP')),
('Gurgaon', (SELECT id FROM states WHERE code = 'HR')),
('Faridabad', (SELECT id FROM states WHERE code = 'HR')),
('Vijayawada', (SELECT id FROM states WHERE code = 'AP')),
('Thane', (SELECT id FROM states WHERE code = 'MH')),
('Navi Mumbai', (SELECT id FROM states WHERE code = 'MH')),
('Nashik', (SELECT id FROM states WHERE code = 'MH')),
('Aurangabad', (SELECT id FROM states WHERE code = 'MH')),
('Jodhpur', (SELECT id FROM states WHERE code = 'RJ')),
('Udaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Dehradun', (SELECT id FROM states WHERE code = 'UK')),
('Ludhiana', (SELECT id FROM states WHERE code = 'PB')),
('Jalandhar', (SELECT id FROM states WHERE code = 'PB')),
('Madurai', (SELECT id FROM states WHERE code = 'TN')),
('Visakhapatnam', (SELECT id FROM states WHERE code = 'AP')),
('Mysuru', (SELECT id FROM states WHERE code = 'KA')),
('Mangalore', (SELECT id FROM states WHERE code = 'KA')),
('Belgaum', (SELECT id FROM states WHERE code = 'KA')),
('Hubli', (SELECT id FROM states WHERE code = 'KA')),
('Rajkot', (SELECT id FROM states WHERE code = 'GJ')),
('Vadodara', (SELECT id FROM states WHERE code = 'GJ')),
('Meerut', (SELECT id FROM states WHERE code = 'UP')),
('Allahabad', (SELECT id FROM states WHERE code = 'UP')),
('Gwalior', (SELECT id FROM states WHERE code = 'MP')),
('Jabalpur', (SELECT id FROM states WHERE code = 'MP')),
('Raipur', (SELECT id FROM states WHERE code = 'CG')),
('Cuttack', (SELECT id FROM states WHERE code = 'OD')),
('Shimla', (SELECT id FROM states WHERE code = 'HP')),
('Siliguri', (SELECT id FROM states WHERE code = 'WB')),
('Jamshedpur', (SELECT id FROM states WHERE code = 'JH')),
('Dhanbad', (SELECT id FROM states WHERE code = 'JH')),
('Bokaro', (SELECT id FROM states WHERE code = 'JH')),
('Durgapur', (SELECT id FROM states WHERE code = 'WB')),
('Asansol', (SELECT id FROM states WHERE code = 'WB'));

-- Insert Categories
INSERT INTO categories (name, description, icon) VALUES
('Hospitals', 'Buy, sell, or lease hospitals and healthcare facilities', 'hospital-icon'),
('Pharma Companies', 'Full or partial stake sale in pharmaceutical companies', 'pharma-icon'),
('Diagnostics', 'Pathology labs, imaging centers, diagnostic facilities', 'diagnostic-icon'),
('Medical Equipment', 'New and used medical equipment for sale', 'equipment-icon');

-- Insert Deal Types
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Hospitals')),
('For Lease', (SELECT id FROM categories WHERE name = 'Hospitals')),
('Full Sale', (SELECT id FROM categories WHERE name = 'Pharma Companies')),
('Partial Sale', (SELECT id FROM categories WHERE name = 'Pharma Companies')),
('For Sale', (SELECT id FROM categories WHERE name = 'Diagnostics')),
('New Equipment', (SELECT id FROM categories WHERE name = 'Medical Equipment')),
('Used Equipment', (SELECT id FROM categories WHERE name = 'Medical Equipment'));

-- Insert Job Categories
INSERT INTO job_categories (name, description) VALUES
('Doctor', 'Medical professionals - MBBS, MD, MS, DM doctors'),
('Nurse', 'Nursing staff - ANM, GNM, BSc Nursing'),
('Technician', 'Lab technicians, radiology technicians, operation theatre technicians'),
('Administrator', 'Hospital administrators, managers, HR, finance'),
('Pharma', 'Pharmaceutical professionals - research, sales, quality control'),
('Support Staff', 'Ward boys, attendants, security, housekeeping'),
('Allied Health', 'Physiotherapists, dietitians, counselors'),
('Other', 'Other healthcare related positions');

-- Insert Equipment Types
INSERT INTO equipment_types (name, category) VALUES
('MRI Scanner', 'Imaging'),
('CT Scanner', 'Imaging'),
('X-Ray Machine', 'Imaging'),
('Ultrasound Machine', 'Imaging'),
('C-Arm', 'Imaging'),
('Mammography Machine', 'Imaging'),
('PET-CT Scanner', 'Imaging'),
('Ventilator', 'Critical Care'),
('ICU Monitor', 'Critical Care'),
('Defibrillator', 'Critical Care'),
('Anesthesia Machine', 'Operation Theatre'),
('Operation Table', 'Operation Theatre'),
('Surgical Lights', 'Operation Theatre'),
('ECG Machine', 'Cardiology'),
('Treadmill (TMT)', 'Cardiology'),
('Blood Analyzer', 'Laboratory'),
('Pathology Lab Equipment', 'Laboratory'),
('Dental Chair', 'Dental'),
('Dialysis Machine', 'Nephrology'),
('Infusion Pump', 'General'),
('Patient Bed', 'General'),
('Wheelchair', 'General'),
('Sterilizer/Autoclave', 'General'),
('OT Light', 'Operation Theatre');

-- Insert Hospital Types
INSERT INTO hospital_types (name, description) VALUES
('Multispeciality', 'Hospitals offering multiple medical specialities'),
('Superspeciality', 'Hospitals focused on specific advanced treatments'),
('Clinic', 'Small healthcare facility for outpatient care'),
('Nursing Home', 'Small to medium healthcare facility'),
('Diagnostic Center', 'Facility focused on medical diagnostics'),
('Day Care Center', 'Facility for day procedures'),
('Polyclinic', 'Multiple specialty outpatient facility');

-- Insert Default Site Settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', 'DH Acquisitions', 'Website name'),
('site_tagline', 'OLX x LinkedIn for Healthcare', 'Website tagline'),
('listing_expiry_days', '90', 'Number of days before listing expires'),
('max_images_per_listing', '10', 'Maximum images allowed per listing'),
('max_cv_size_mb', '5', 'Maximum CV file size in MB'),
('max_image_size_mb', '5', 'Maximum image file size in MB'),
('enable_registration', 'true', 'Allow new user registrations'),
('admin_email', 'admin@dhacquisitions.com', 'Admin notification email'),
('contact_email', 'contact@dhacquisitions.com', 'Contact email displayed on site'),
('support_phone', '1800-XXX-XXXX', 'Support phone number');

-- Insert Default Admin User
-- Password: Admin@123 (BCrypt encoded)
INSERT INTO users (full_name, email, password_hash, mobile_number, is_email_verified, status) VALUES
('System Admin', 'admin@dhacquisitions.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.qW0Ll6UXrFxI5dWt3C', '9999999999', TRUE, 'ACTIVE');

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'admin@dhacquisitions.com'), 'ADMIN');

-- ============================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================

CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_deal_type ON listings(deal_type_id);
CREATE INDEX idx_listings_city ON listings(city_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_price ON listings(asking_price);
CREATE INDEX idx_listings_created ON listings(created_at);
CREATE INDEX idx_listings_confidential ON listings(is_confidential);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(job_category_id);
CREATE INDEX idx_jobs_city ON jobs(city_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_deadline ON jobs(application_deadline);

CREATE INDEX idx_inquiries_listing ON inquiries(listing_id);
CREATE INDEX idx_inquiries_buyer ON inquiries(buyer_id);
CREATE INDEX idx_inquiries_seller ON inquiries(seller_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_seeker ON job_applications(seeker_id);
CREATE INDEX idx_applications_status ON job_applications(status);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_verified_buyer ON users(is_verified_buyer);

-- ============================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================

-- View for listing summary with category and city names
CREATE VIEW vw_listing_summary AS
SELECT 
    l.id,
    l.title,
    l.short_description,
    l.asking_price,
    l.price_negotiable,
    l.is_confidential,
    l.status,
    l.view_count,
    l.inquiry_count,
    l.is_featured,
    l.created_at,
    c.name AS category_name,
    dt.name AS deal_type,
    COALESCE(city.name, l.city_name) AS city_name,
    s.name AS state_name,
    u.full_name AS seller_name,
    u.email AS seller_email,
    (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) AS primary_image
FROM listings l
JOIN categories c ON l.category_id = c.id
JOIN deal_types dt ON l.deal_type_id = dt.id
LEFT JOIN cities city ON l.city_id = city.id
LEFT JOIN states s ON city.state_id = s.id
JOIN users u ON l.user_id = u.id;

-- View for job summary with employer and city names
CREATE VIEW vw_job_summary AS
SELECT 
    j.id,
    j.title,
    j.specialisation,
    j.employment_type,
    j.salary_min_lpa,
    j.salary_max_lpa,
    j.experience_required,
    j.application_deadline,
    j.number_of_openings,
    j.status,
    j.view_count,
    j.application_count,
    j.is_featured,
    j.created_at,
    jc.name AS category_name,
    city.name AS city_name,
    s.name AS state_name,
    u.full_name AS employer_name,
    u.company_name AS employer_company
FROM jobs j
JOIN job_categories jc ON j.job_category_id = jc.id
JOIN cities city ON j.city_id = city.id
JOIN states s ON city.state_id = s.id
JOIN users u ON j.employer_id = u.id;

-- View for admin dashboard statistics
CREATE VIEW vw_admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') AS active_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURDATE()) AS new_users_today,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_users_week,
    (SELECT COUNT(*) FROM listings) AS total_listings,
    (SELECT COUNT(*) FROM listings WHERE status = 'PENDING') AS pending_listings,
    (SELECT COUNT(*) FROM listings WHERE status = 'ACTIVE') AS active_listings,
    (SELECT COUNT(*) FROM listings WHERE created_at >= CURDATE()) AS new_listings_today,
    (SELECT COUNT(*) FROM jobs) AS total_jobs,
    (SELECT COUNT(*) FROM jobs WHERE status = 'PENDING') AS pending_jobs,
    (SELECT COUNT(*) FROM jobs WHERE status = 'ACTIVE') AS active_jobs,
    (SELECT COUNT(*) FROM jobs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_jobs_week,
    (SELECT COUNT(*) FROM inquiries WHERE created_at >= CURDATE()) AS inquiries_today,
    (SELECT COUNT(*) FROM buyer_verifications WHERE status = 'PENDING') AS pending_verifications,
    (SELECT COUNT(*) FROM job_applications WHERE applied_at >= CURDATE()) AS applications_today;

-- ============================================================
-- END OF DATABASE SCHEMA
-- ============================================================
