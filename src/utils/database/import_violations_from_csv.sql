
-- This SQL script is designed to import violation data from a CSV file
-- The CSV file should have these headings: 
-- _id,casefile_number,address,parcel_id,status,investigation_date,
-- violation_description,violation_code_section,violation_spec_instructions,
-- investigation_outcome,investigation_findings

-- First, create a temporary table to hold the imported CSV data
CREATE TEMPORARY TABLE temp_violations (
    _id TEXT,
    casefile_number TEXT,
    address TEXT,
    parcel_id TEXT,
    status TEXT,
    investigation_date TEXT,
    violation_description TEXT,
    violation_code_section TEXT,
    violation_spec_instructions TEXT,
    investigation_outcome TEXT,
    investigation_findings TEXT
);

-- Import the CSV file
-- Replace '/path/to/your/file.csv' with the actual path to your CSV file
-- You'll need appropriate permissions for the database to read this file
COPY temp_violations FROM '/path/to/your/file.csv' WITH CSV HEADER;

-- Insert data from the temporary table into the violations table
INSERT INTO public.violations (
    violation_id,
    address,
    violation_type,
    date_issued,
    status,
    original_status,
    description,
    property_owner,
    investigation_outcome,
    investigation_findings
)
SELECT 
    casefile_number,
    address,
    COALESCE(violation_code_section, 'Unspecified Violation Type'),
    -- Try to parse the date, default to current date if it fails
    CASE 
        WHEN investigation_date ~ '^\d{4}-\d{2}-\d{2}' THEN 
            investigation_date::TIMESTAMP WITH TIME ZONE 
        ELSE 
            now() 
    END,
    -- Map status to standardized values while preserving original
    CASE 
        WHEN status ILIKE '%closed%' OR status ILIKE '%resolved%' THEN 'Closed'
        WHEN status ILIKE '%progress%' OR status ILIKE '%pending%' THEN 'In Progress'
        ELSE 'Open'
    END,
    status,
    COALESCE(violation_description, 'No description provided'),
    -- Use parcel_id as property owner if no better data available
    parcel_id,
    investigation_outcome,
    investigation_findings
FROM temp_violations;

-- Add logging to track the import
SELECT COUNT(*) AS imported_records FROM temp_violations;

-- Drop the temporary table
DROP TABLE temp_violations;

-- Refresh the indices
REINDEX TABLE public.violations;

-- Optional: Output a sample of the imported data
SELECT * FROM public.violations ORDER BY created_at DESC LIMIT 5;
