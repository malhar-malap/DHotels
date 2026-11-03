-- ============================================================
-- DHotels24.in Portal Database Schema
-- Hospitality Assets & Acquisitions Marketplace (Hotels, Cafes, Restaurants, Banquets, Resorts)
-- Database: dhotels_portal
-- ============================================================

CREATE DATABASE IF NOT EXISTS dhotels_portal;
USE dhotels_portal;

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

-- Categories Table (Hotels, Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts)
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

-- Listings Table (Main table for all hospitality asset listings)
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

-- Hospitality Property Details Table (1-to-1 with listings)
CREATE TABLE hospitality_property_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL UNIQUE,
    number_of_rooms INT NULL,               -- Hotels only
    plot_area_sqft DECIMAL(12, 2) NULL,     -- Hotels only
    plot_area_unit VARCHAR(10) NULL,        -- SQFT or ACRE, as the seller entered it
    constructed_area_sqft DECIMAL(12, 2) NULL, -- Hotels only
    title_type VARCHAR(50) NULL,            -- Hotels only (Freehold / Leasehold)
    carpet_area_sqft DECIMAL(12, 2) NULL,   -- Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Payments Table (Razorpay contact unlock & transaction records)
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(256),
    buyer_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
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

-- Mandate Submissions Table
CREATE TABLE mandate_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    objectives TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'NEW',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Consultation Requests Table (Schedule a Call)
CREATE TABLE consultation_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    preferred_date DATE,
    time_slot VARCHAR(20),
    topic TEXT,
    status VARCHAR(20) DEFAULT 'PENDING_CALL',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    employment_type VARCHAR(20) NOT NULL,  -- FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP
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
('Goa', (SELECT id FROM states WHERE code = 'GA')),
('Delhi', (SELECT id FROM states WHERE code = 'DL')),
('Bangalore', (SELECT id FROM states WHERE code = 'KA')),
('Chennai', (SELECT id FROM states WHERE code = 'TN')),
('Hyderabad', (SELECT id FROM states WHERE code = 'TS')),
('Kolkata', (SELECT id FROM states WHERE code = 'WB')),
('Ahmedabad', (SELECT id FROM states WHERE code = 'GJ')),
('Surat', (SELECT id FROM states WHERE code = 'GJ')),
('Jaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Udaipur', (SELECT id FROM states WHERE code = 'RJ')),
('Jodhpur', (SELECT id FROM states WHERE code = 'RJ')),
('Lucknow', (SELECT id FROM states WHERE code = 'UP')),
('Chandigarh', (SELECT id FROM states WHERE code = 'PB')),
('Indore', (SELECT id FROM states WHERE code = 'MP')),
('Bhopal', (SELECT id FROM states WHERE code = 'MP')),
('Kochi', (SELECT id FROM states WHERE code = 'KL')),
('Thiruvananthapuram', (SELECT id FROM states WHERE code = 'KL')),
('Noida', (SELECT id FROM states WHERE code = 'UP')),
('Gurgaon', (SELECT id FROM states WHERE code = 'HR')),
('Thane', (SELECT id FROM states WHERE code = 'MH')),
('Navi Mumbai', (SELECT id FROM states WHERE code = 'MH')),
('Nashik', (SELECT id FROM states WHERE code = 'MH')),
('Dehradun', (SELECT id FROM states WHERE code = 'UK')),
('Shimla', (SELECT id FROM states WHERE code = 'HP')),
('Manali', (SELECT id FROM states WHERE code = 'HP')),
('Mysuru', (SELECT id FROM states WHERE code = 'KA')),
('Mangalore', (SELECT id FROM states WHERE code = 'KA'));

-- ============================================================
-- HOSPITALITY MASTER CATEGORIES & DEAL TYPES
-- ============================================================

INSERT INTO categories (name, description, icon) VALUES
('Hotels', 'Hotels, heritage stays, and commercial lodging properties', 'hotel-icon'),
('Restaurants', 'Dine-in restaurants, casual dining, and food establishments', 'utensils-icon'),
('Cafe', 'Coffee shops, bakeries, and bistro cafes', 'coffee-icon'),
('Banquet halls', 'Event spaces, marriage halls, and celebration venues', 'glass-cheers-icon'),
('Restaurants and Bar', 'Resto-bars, pubs, lounges, and licensed establishments', 'cocktail-icon'),
('Resorts', 'Luxury resorts, wellness retreats, and holiday destination properties', 'umbrella-beach-icon');

-- Deal Types for Hotels: For Sale, For Lease, Profit Sharing
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Hotels')),
('For Lease', (SELECT id FROM categories WHERE name = 'Hotels')),
('Profit Sharing', (SELECT id FROM categories WHERE name = 'Hotels'));

-- Deal Types for Restaurants: For Sale, For Lease
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Restaurants')),
('For Lease', (SELECT id FROM categories WHERE name = 'Restaurants'));

-- Deal Types for Cafe: For Sale, For Lease
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Cafe')),
('For Lease', (SELECT id FROM categories WHERE name = 'Cafe'));

-- Deal Types for Banquet halls: For Sale, For Lease
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Banquet halls')),
('For Lease', (SELECT id FROM categories WHERE name = 'Banquet halls'));

-- Deal Types for Restaurants and Bar: For Sale, For Lease
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Restaurants and Bar')),
('For Lease', (SELECT id FROM categories WHERE name = 'Restaurants and Bar'));

-- Deal Types for Resorts: For Sale, For Lease
INSERT INTO deal_types (name, category_id) VALUES
('For Sale', (SELECT id FROM categories WHERE name = 'Resorts')),
('For Lease', (SELECT id FROM categories WHERE name = 'Resorts'));

-- Insert Hospitality Job Categories
INSERT INTO job_categories (name, description) VALUES
('Head / Executive Chef', 'Executive chefs, head chefs, and culinary directors'),
('Sous / Line Cook', 'Sous chefs, commis chefs, pastry chefs, and line cooks'),
('Restaurant / General Manager', 'General managers, restaurant managers, operations heads'),
('F&B Service Staff', 'Captains, stewards, waitstaff, and hosts'),
('Bartender / Mixologist', 'Bartenders, mixologists, and bar attendants'),
('Barista', 'Specialty coffee baristas and cafe crew'),
('Front Desk & Concierge', 'Front office executives, receptionists, concierge'),
('Housekeeping & Maintenance', 'Housekeeping supervisors, room attendants, maintenance engineers'),
('Other Hospitality Roles', 'Other hotel and food service positions');

-- Insert Default Site Settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', 'DHotels24.in', 'Website name'),
('site_tagline', 'Acquisitions & Marketplace for Hotels, Cafes & Restaurants', 'Website tagline'),
('listing_expiry_days', '90', 'Number of days before listing expires'),
('max_images_per_listing', '10', 'Maximum images allowed per listing'),
('max_cv_size_mb', '5', 'Maximum CV file size in MB'),
('max_image_size_mb', '5', 'Maximum image file size in MB'),
('enable_registration', 'true', 'Allow new user registrations'),
('admin_email', 'admin@dhotels24.in', 'Admin notification email'),
('contact_email', 'contact@dhotels24.in', 'Contact email displayed on site'),
('support_phone', '1800-XXX-XXXX', 'Support phone number');

-- No default admin account is created (a shared, known password would be a backdoor).
-- To create one: sign up normally on the site, then grant the role in the database:
--   INSERT INTO user_roles (user_id, role, created_at)
--   SELECT id, 'ADMIN', NOW() FROM users WHERE email = 'you@example.com';
-- For local development, SEED_SAMPLE_USER=true also creates sample user and admin accounts (see DataInitializer).

-- Views
CREATE VIEW vw_active_listings AS
SELECT 
    l.id,
    l.title,
    l.short_description,
    l.asking_price,
    l.price_negotiable,
    l.is_confidential,
    l.created_at,
    c.name AS category_name,
    dt.name AS deal_type_name,
    city.name AS city_name,
    s.name AS state_name,
    (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = TRUE LIMIT 1) AS primary_image
FROM listings l
JOIN categories c ON l.category_id = c.id
JOIN deal_types dt ON l.deal_type_id = dt.id
LEFT JOIN cities city ON l.city_id = city.id
LEFT JOIN states s ON city.state_id = s.id
WHERE l.status = 'ACTIVE';

CREATE VIEW vw_active_jobs AS
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
