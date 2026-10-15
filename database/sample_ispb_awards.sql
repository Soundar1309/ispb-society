-- Sample data for ISPB Awards (Award-level structure with PDF support)
-- Run this in Supabase SQL Editor after 20261015120000_add_ispb_awards_pdf.sql

-- Clear any old recipient-centric sample records if desired:
-- TRUNCATE TABLE public.ispb_awards;

INSERT INTO public.ispb_awards
  (award_year, award_number, award_name, description, pdf_url, display_order, is_active)
VALUES
-- ===== 2025 =====
(
  2025,
  'ISPB-2025-01',
  'ISPB Lifetime Achievement Award',
  'Recognises senior scientists and plant breeders who have made monumental, lifelong contributions to crop improvement, genetic research, and agricultural education in India.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  1,
  true
),
(
  2025,
  'ISPB-2025-02',
  'Young Scientist Award',
  'Conferred to promising early-career plant breeders and researchers under 40 years of age demonstrating exceptional innovation in breeding methodologies, Speed Breeding, or molecular genomics.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  2,
  true
),
(
  2025,
  'ISPB-2025-03',
  'Best Ph.D. Thesis in Plant Breeding Award',
  'Awarded annually to honour the best doctoral thesis submitted to an Indian agricultural university in the discipline of Genetics and Plant Breeding.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  3,
  true
),
(
  2025,
  'ISPB-2025-04',
  'Distinguished Breeder Award for Pulses & Oilseeds',
  'Recognises breakthrough varietal developments and high-yield, climate-resilient cultivar releases in national mandate pulse and oilseed crops.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  4,
  true
),

-- ===== 2024 =====
(
  2024,
  'ISPB-2024-01',
  'ISPB Lifetime Achievement Award',
  'Presented in appreciation of distinguished service, continuous leadership, and mentorship fostering generations of plant breeders across premier ICAR and State Agricultural Universities.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  1,
  true
),
(
  2024,
  'ISPB-2024-02',
  'Young Scientist Award',
  'Honours innovative research contributions in drought-tolerance genetics, marker-assisted selection, and climate-resilient agricultural systems.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  2,
  true
),
(
  2024,
  'ISPB-2024-03',
  'Best Ph.D. Thesis in Plant Breeding Award',
  'Recognises pioneering Ph.D. research on genome-wide association studies and molecular dissection of key agronomic traits in cereal crops.',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  3,
  true
);
