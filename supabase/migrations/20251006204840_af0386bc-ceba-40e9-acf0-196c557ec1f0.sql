-- Add year field to mandates table and make title nullable
ALTER TABLE mandates 
  ALTER COLUMN title DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add year field to activities table and make title nullable
ALTER TABLE activities 
  ALTER COLUMN title DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS year INTEGER;