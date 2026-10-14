-- Sample data for ISPB Awards: 2 years x 3 awards x 3 recipients each (18 rows)
-- Run after 20261014120000_create_ispb_awards.sql. Safe to delete from admin panel afterwards.
INSERT INTO public.ispb_awards
  (award_year, award_number, award_name, recipient_name, affiliation, location, description, display_order)
VALUES
-- ===== 2025 =====
(2025, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. Ramesh Chandra Nair', 'Tamil Nadu Agricultural University', 'Coimbatore, Tamil Nadu', 'Recognised for four decades of pioneering work in rice breeding and farmer-participatory varietal selection.', 1),
(2025, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. Sunita Verma', 'ICAR-Indian Agricultural Research Institute', 'New Delhi', 'Honoured for her lifelong contribution to wheat genetics and disease-resistant cultivar development.', 2),
(2025, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. K. Venkatesan', 'University of Agricultural Sciences', 'Bengaluru, Karnataka', 'Awarded for outstanding leadership in pulses improvement and mentoring generations of plant breeders.', 3),
(2025, 'A-02', 'Young Scientist Award', 'Dr. Priya Menon', 'Kerala Agricultural University', 'Thrissur, Kerala', 'Recognised for developing climate-resilient coconut hybrids with improved yield stability.', 4),
(2025, 'A-02', 'Young Scientist Award', 'Dr. Arjun Patel', 'Anand Agricultural University', 'Anand, Gujarat', 'Honoured for innovative genomic-selection approaches in groundnut breeding.', 5),
(2025, 'A-02', 'Young Scientist Award', 'Dr. Meera Iyer', 'ICAR-Sugarcane Breeding Institute', 'Coimbatore, Tamil Nadu', 'Awarded for contributions to red-rot resistant sugarcane clones.', 6),
(2025, 'A-03', 'Best Ph.D. Thesis Award', 'Ananya Sharma', 'Punjab Agricultural University', 'Ludhiana, Punjab', 'Thesis on molecular mapping of heat-tolerance QTLs in bread wheat.', 7),
(2025, 'A-03', 'Best Ph.D. Thesis Award', 'Rahul Deshmukh', 'Mahatma Phule Krishi Vidyapeeth', 'Rahuri, Maharashtra', 'Thesis on heterosis and combining ability in cotton for drought tolerance.', 8),
(2025, 'A-03', 'Best Ph.D. Thesis Award', 'Lakshmi Prasanna', 'Acharya N.G. Ranga Agricultural University', 'Guntur, Andhra Pradesh', 'Thesis on marker-assisted introgression of bacterial blight resistance in rice.', 9),
-- ===== 2024 =====
(2024, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. S. Gopalakrishnan', 'ICAR-Indian Agricultural Research Institute', 'New Delhi', 'Recognised for the development of aromatic basmati varieties grown across millions of hectares.', 1),
(2024, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. Meenakshi Rao', 'G.B. Pant University of Agriculture and Technology', 'Pantnagar, Uttarakhand', 'Honoured for pioneering work in cytogenetics and wide hybridisation in cereals.', 2),
(2024, 'A-01', 'ISPB Lifetime Achievement Award', 'Dr. P. K. Das', 'Bidhan Chandra Krishi Viswavidyalaya', 'Kalyani, West Bengal', 'Awarded for sustained contributions to jute and oilseed crop improvement.', 3),
(2024, 'A-02', 'Young Scientist Award', 'Dr. Kavya Reddy', 'ICRISAT', 'Hyderabad, Telangana', 'Recognised for accelerating chickpea breeding through speed-breeding protocols.', 4),
(2024, 'A-02', 'Young Scientist Award', 'Dr. Imran Khan', 'SKUAST-Kashmir', 'Srinagar, Jammu & Kashmir', 'Honoured for cold-tolerant rice lines suited to high-altitude cultivation.', 5),
(2024, 'A-02', 'Young Scientist Award', 'Dr. Neha Joshi', 'Rajasthan Agricultural Research Institute', 'Durgapura, Rajasthan', 'Awarded for pearl millet hybrids with enhanced iron and zinc content.', 6),
(2024, 'A-03', 'Best Ph.D. Thesis Award', 'Sanjay Kumar', 'Bihar Agricultural University', 'Sabour, Bihar', 'Thesis on genetic dissection of submergence tolerance in rice.', 7),
(2024, 'A-03', 'Best Ph.D. Thesis Award', 'Divya Nambiar', 'Tamil Nadu Agricultural University', 'Coimbatore, Tamil Nadu', 'Thesis on genome-wide association studies for yield traits in sorghum.', 8),
(2024, 'A-03', 'Best Ph.D. Thesis Award', 'Harpreet Singh', 'Punjab Agricultural University', 'Ludhiana, Punjab', 'Thesis on mutation breeding for improved oil quality in mustard.', 9);

-- Sample recipient photos (requires 20261014130000_add_ispb_awards_image.sql)
UPDATE public.ispb_awards
SET image_url = 'https://i.pravatar.cc/400?img=' || (display_order + CASE WHEN award_year = 2025 THEN 0 ELSE 9 END)
WHERE image_url IS NULL;

-- Award number is per person (unique), e.g. ISPB-2025-001
UPDATE public.ispb_awards
SET award_number = 'ISPB-' || award_year || '-' || lpad(display_order::text, 3, '0');
