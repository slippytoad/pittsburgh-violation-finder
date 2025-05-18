
-- Create violations table - matching exactly with API schema
CREATE TABLE IF NOT EXISTS public.violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    _id TEXT, -- API ID field
    casefile_number TEXT,
    address TEXT NOT NULL,
    violation_description TEXT,
    status TEXT NOT NULL,
    original_status TEXT,
    parcel_id TEXT,
    violation_code TEXT,
    violation_code_section TEXT,
    inspection_result TEXT,
    violation_date TEXT,
    investigation_outcome TEXT,
    investigation_findings TEXT,
    related_violations_count INTEGER,
    previous_states_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policy
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (read-only)
CREATE POLICY "Allow anonymous read access" ON public.violations
    FOR SELECT USING (true);

-- Create policy for authenticated users (full access)
CREATE POLICY "Allow authenticated users full access" ON public.violations
    USING (auth.role() = 'authenticated');

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_violations_address ON public.violations (address);
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.violations (status);
CREATE INDEX IF NOT EXISTS idx_violations__id ON public.violations (_id);

-- Sample data insertion
INSERT INTO public.violations (
    _id,
    casefile_number,
    address,
    status,
    original_status,
    violation_description,
    investigation_outcome,
    investigation_findings
) VALUES
(
    'PLI-2025-00001',
    'PLI-2025-00001',
    '123 Main Street, Pittsburgh, PA 15213',
    'Open',
    'Active Violation',
    'Unsafe structural conditions identified during routine inspection',
    NULL,
    NULL
),
(
    'PLI-2025-00002',
    'PLI-2025-00002',
    '456 Oak Avenue, Pittsburgh, PA 15217',
    'In Progress',
    'Under Investigation',
    'Accumulated trash and debris in yard creating health hazard',
    'Owner has begun cleanup process',
    'Initial inspection showed significant progress'
),
(
    'PLI-2025-00003',
    'PLI-2025-00003',
    '789 Pine Street, Pittsburgh, PA 15232',
    'Closed',
    'Resolved',
    'Unauthorized commercial activity in residential zone',
    'Commercial activity ceased',
    'Follow-up inspection confirmed compliance with zoning regulations'
),
(
    'PLI-2025-00004',
    'PLI-2025-00004',
    '321 Elm Street, Pittsburgh, PA 15206',
    'Open',
    'Notice Issued',
    'Operating without valid occupancy permit',
    NULL,
    NULL
),
(
    'PLI-2025-00005',
    'PLI-2025-00005',
    '654 Maple Drive, Pittsburgh, PA 15219',
    'In Progress',
    'Inspection Scheduled',
    'Missing fire extinguishers and blocked emergency exits',
    'Owner has purchased required equipment',
    'Awaiting follow-up inspection to verify installation'
);

-- Create index on _id column (if it doesn't exist already)
CREATE INDEX IF NOT EXISTS idx_violations__id ON public.violations (_id);
