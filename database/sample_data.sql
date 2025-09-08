-- Sample Data for ISPB Application MySQL Database

-- Sample Activities
INSERT INTO activities (id, title, content, display_order, is_active) VALUES
(UUID(), 'Research and Publications', 'Promoting research activities and scholarly publications in pathology and bacteriology.', 1, TRUE),
(UUID(), 'Educational Programs', 'Organizing educational workshops, seminars, and training programs for members.', 2, TRUE),
(UUID(), 'Professional Development', 'Supporting continuous professional development of pathologists and bacteriologists.', 3, TRUE),
(UUID(), 'Quality Assurance', 'Maintaining high standards of quality in pathological and bacteriological practices.', 4, TRUE);

-- Sample Gallery Categories
INSERT INTO gallery_categories (id, name, display_order, is_active) VALUES
(UUID(), 'Conferences', 1, TRUE),
(UUID(), 'Workshops', 2, TRUE),
(UUID(), 'Awards Ceremony', 3, TRUE),
(UUID(), 'Research Events', 4, TRUE);

-- Sample Conferences
INSERT INTO conferences (id, title, description, venue, date_from, date_to, fee, registration_required, is_active) VALUES
(UUID(), 'Annual ISPB Conference 2024', 'The premier conference for pathologists and bacteriologists featuring latest research and innovations.', 'Mumbai Convention Center', '2024-03-15', '2024-03-17', 5000.00, TRUE, TRUE),
(UUID(), 'Molecular Pathology Workshop', 'Hands-on workshop covering advanced techniques in molecular pathology.', 'Delhi Medical College', '2024-04-10', '2024-04-12', 3000.00, TRUE, TRUE),
(UUID(), 'Digital Pathology Symposium', 'Exploring the future of digital pathology and AI applications.', 'Bangalore Tech Center', '2024-05-20', '2024-05-21', 2500.00, TRUE, TRUE);

-- Sample Mandates
INSERT INTO mandates (id, title, content, display_order, is_active) VALUES
(UUID(), 'Professional Excellence', 'To maintain the highest standards of professional excellence in pathology and bacteriology practice.', 1, TRUE),
(UUID(), 'Education and Training', 'To provide comprehensive education and training programs for healthcare professionals.', 2, TRUE),
(UUID(), 'Research and Innovation', 'To promote research activities and innovation in the field of pathology and bacteriology.', 3, TRUE),
(UUID(), 'Quality Assurance', 'To establish and maintain quality assurance programs for laboratory services.', 4, TRUE);

-- Sample Membership Plans
INSERT INTO membership_plans (id, plan_type, title, price, duration_months, features, is_active) VALUES
(UUID(), 'annual', 'Annual Membership', 2000.00, 12, '["Access to all conferences", "Monthly newsletters", "Online resources", "Networking opportunities"]', TRUE),
(UUID(), 'student', 'Student Membership', 500.00, 12, '["Discounted conference rates", "Educational resources", "Mentorship programs"]', TRUE),
(UUID(), 'lifetime', 'Lifetime Membership', 25000.00, 0, '["Lifetime access to all benefits", "Priority booking", "Special recognition", "Governance voting rights"]', TRUE),
(UUID(), 'corporate', 'Corporate Membership', 10000.00, 12, '["Multiple employee access", "Corporate training programs", "Bulk discount on events"]', TRUE);

-- Sample Office Bearers
INSERT INTO office_bearers (id, name, designation, institution, display_order, is_active) VALUES
(UUID(), 'Dr. Rajesh Kumar', 'President', 'AIIMS Delhi', 1, TRUE),
(UUID(), 'Dr. Priya Sharma', 'Vice President', 'PGIMER Chandigarh', 2, TRUE),
(UUID(), 'Dr. Amit Gupta', 'Secretary', 'KEM Hospital Mumbai', 3, TRUE),
(UUID(), 'Dr. Sunita Patel', 'Treasurer', 'CMC Vellore', 4, TRUE),
(UUID(), 'Dr. Vikram Singh', 'Chief Editor', 'SGPGIMS Lucknow', 5, TRUE);

-- Sample Life Members
INSERT INTO life_members (id, name, designation, institution, specialization, member_since, is_active) VALUES
(UUID(), 'Dr. Arun Krishnan', 'Professor & Head', 'AIIMS New Delhi', 'Hematopathology', '2010', TRUE),
(UUID(), 'Dr. Meera Desai', 'Senior Consultant', 'Tata Memorial Hospital', 'Cytopathology', '2012', TRUE),
(UUID(), 'Dr. Suresh Reddy', 'Director', 'Apollo Hospitals', 'Clinical Microbiology', '2008', TRUE),
(UUID(), 'Dr. Kavita Jain', 'Professor', 'PGIMER Chandigarh', 'Surgical Pathology', '2015', TRUE),
(UUID(), 'Dr. Ramesh Nair', 'Chief Pathologist', 'Max Healthcare', 'Molecular Pathology', '2011', TRUE);

-- Sample Publications
INSERT INTO publications (id, title, authors, journal, volume, issue, pages, year, category, is_featured) VALUES
(UUID(), 'Advances in Digital Pathology: A Comprehensive Review', 'Dr. Kumar R, Dr. Sharma P, Dr. Gupta A', 'Indian Journal of Pathology', '45', '2', '123-145', 2024, 'research', TRUE),
(UUID(), 'Molecular Markers in Breast Cancer Diagnosis', 'Dr. Patel S, Dr. Singh V', 'Pathology International', '38', '4', '78-92', 2024, 'research', FALSE),
(UUID(), 'Quality Control in Clinical Microbiology', 'Dr. Krishnan A, Dr. Desai M', 'Journal of Clinical Microbiology', '52', '3', '234-248', 2023, 'research', TRUE),
(UUID(), 'Emerging Trends in Cytopathology', 'Dr. Reddy S, Dr. Jain K', 'Cytopathology Today', '15', '1', '45-62', 2024, 'review', FALSE);

-- Sample User Roles
INSERT INTO user_roles (id, user_id, role, full_name, email, institution) VALUES
(UUID(), UUID(), 'admin', 'Dr. Admin User', 'admin@ispb.org', 'ISPB Headquarters'),
(UUID(), UUID(), 'member', 'Dr. John Doe', 'john.doe@hospital.com', 'City General Hospital'),
(UUID(), UUID(), 'member', 'Dr. Jane Smith', 'jane.smith@medical.edu', 'Medical College'),
(UUID(), UUID(), 'member', 'Dr. Robert Wilson', 'robert.wilson@clinic.org', 'Wilson Diagnostic Center');

-- Sample Contact Messages
INSERT INTO contact_messages (id, name, email, subject, message, status) VALUES
(UUID(), 'Dr. Sarah Johnson', 'sarah.johnson@email.com', 'Membership Inquiry', 'I would like to know more about the annual membership benefits.', 'unread'),
(UUID(), 'Prof. Michael Brown', 'michael.brown@university.edu', 'Conference Registration', 'How can I register for the upcoming pathology conference?', 'read'),
(UUID(), 'Dr. Lisa Davis', 'lisa.davis@lab.com', 'Technical Support', 'I am having issues accessing the online resources portal.', 'unread');