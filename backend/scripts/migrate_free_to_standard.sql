-- Migration script to change Free plan to Standard plan
-- This script should be run on the existing database

-- Update existing enterprises with 'Free' plan to 'Standard'
UPDATE enterprises 
SET plan = 'Standard' 
WHERE plan = 'Free';

-- The schema.sql file has already been updated to use 'Standard' as default
-- No need to alter the table structure as the column remains the same type (text)

-- Verify the update
SELECT COUNT(*) as updated_enterprises 
FROM enterprises 
WHERE plan = 'Standard';
