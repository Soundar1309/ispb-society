-- MySQL Database Schema for ISPB Application
-- Generated from Supabase schema

-- Create database (uncomment if needed)
-- CREATE DATABASE ispb_app;
-- USE ispb_app;

-- Set character set and collation
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Activities table
CREATE TABLE activities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Conference registrations table
CREATE TABLE conference_registrations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    conference_id CHAR(36),
    registration_type VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending',
    amount_paid DECIMAL(10,2),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conferences table
CREATE TABLE conferences (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    date_from DATE,
    date_to DATE,
    deadline DATE,
    fee DECIMAL(10,2),
    registration_required BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    link TEXT,
    attachment_url TEXT,
    registration_form_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE contact_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery categories table
CREATE TABLE gallery_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name TEXT NOT NULL,
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Gallery table
CREATE TABLE gallery (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    category_id CHAR(36),
    image_size VARCHAR(50) DEFAULT '405x256',
    file_format VARCHAR(10) DEFAULT 'jpg',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES gallery_categories(id) ON DELETE SET NULL
);

-- Life members table
CREATE TABLE life_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name TEXT NOT NULL,
    designation TEXT,
    institution TEXT,
    specialization TEXT,
    member_since VARCHAR(50),
    image_url TEXT,
    email TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mandates table
CREATE TABLE mandates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Membership plans table
CREATE TABLE membership_plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_type TEXT NOT NULL,
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    features JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memberships table
CREATE TABLE memberships (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    membership_type TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    member_code VARCHAR(50),
    valid_from DATE,
    valid_until DATE,
    is_manual BOOLEAN DEFAULT FALSE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Office bearers table
CREATE TABLE office_bearers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    institution TEXT,
    image_url TEXT,
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    membership_id CHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE
);

-- Payment tracking table
CREATE TABLE payment_tracking (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    membership_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE SET NULL
);

-- Publications table
CREATE TABLE publications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title TEXT NOT NULL,
    authors TEXT,
    journal TEXT,
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    year INT,
    doi TEXT,
    pdf_url TEXT,
    pdf_file_url TEXT,
    link TEXT,
    category VARCHAR(50) DEFAULT 'research',
    status VARCHAR(50) DEFAULT 'published',
    is_featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    cover_image_url TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    role TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    phone VARCHAR(20),
    institution TEXT,
    designation TEXT,
    specialization TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE conference_registrations 
ADD FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_activities_active ON activities(is_active);
CREATE INDEX idx_conferences_active ON conferences(is_active);
CREATE INDEX idx_conferences_dates ON conferences(date_from, date_to);
CREATE INDEX idx_gallery_active ON gallery(is_active);
CREATE INDEX idx_gallery_category ON gallery(category_id);
CREATE INDEX idx_life_members_active ON life_members(is_active);
CREATE INDEX idx_mandates_active ON mandates(is_active);
CREATE INDEX idx_membership_plans_active ON membership_plans(is_active);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_office_bearers_active ON office_bearers(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_payment_tracking_user ON payment_tracking(user_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_featured ON publications(is_featured);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);