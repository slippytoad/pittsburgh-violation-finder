
-- Create violations table
CREATE TABLE IF NOT EXISTS public.violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id TEXT,
    address TEXT NOT NULL,
    violation_type TEXT NOT NULL,
    date_issued TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    original_status TEXT,
    description TEXT,
    property_owner TEXT,
    fine_amount DECIMAL(10, 2),
    due_date TIMESTAMP WITH TIME ZONE,
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

-- Sample data insertion
INSERT INTO public.violations (
    violation_id,
    address,
    violation_type,
    date_issued,
    status,
    original_status,
    description,
    property_owner,
    fine_amount,
    due_date,
    investigation_outcome,
    investigation_findings
) VALUES
(
    'PLI-2025-00001',
    '123 Main Street, Pittsburgh, PA 15213',
    'Building Code Violation',
    '2025-01-15T10:30:00Z',
    'Open',
    'Active Violation',
    'Unsafe structural conditions identified during routine inspection',
    'John Smith',
    500.00,
    '2025-03-15T23:59:59Z',
    NULL,
    NULL
),
(
    'PLI-2025-00002',
    '456 Oak Avenue, Pittsburgh, PA 15217',
    'Property Maintenance',
    '2025-01-20T14:15:00Z',
    'In Progress',
    'Under Investigation',
    'Accumulated trash and debris in yard creating health hazard',
    'Sarah Johnson',
    250.00,
    '2025-03-20T23:59:59Z',
    'Owner has begun cleanup process',
    'Initial inspection showed significant progress'
),
(
    'PLI-2025-00003',
    '789 Pine Street, Pittsburgh, PA 15232',
    'Zoning Violation',
    '2025-01-25T09:45:00Z',
    'Closed',
    'Resolved',
    'Unauthorized commercial activity in residential zone',
    'Robert Wilson',
    750.00,
    '2025-02-25T23:59:59Z',
    'Commercial activity ceased',
    'Follow-up inspection confirmed compliance with zoning regulations'
),
(
    'PLI-2025-00004',
    '321 Elm Street, Pittsburgh, PA 15206',
    'Occupancy Permit',
    '2025-02-01T11:00:00Z',
    'Open',
    'Notice Issued',
    'Operating without valid occupancy permit',
    'Michael Brown',
    1000.00,
    '2025-04-01T23:59:59Z',
    NULL,
    NULL
),
(
    'PLI-2025-00005',
    '654 Maple Drive, Pittsburgh, PA 15219',
    'Fire Safety',
    '2025-02-05T15:30:00Z',
    'In Progress',
    'Inspection Scheduled',
    'Missing fire extinguishers and blocked emergency exits',
    'Jennifer Davis',
    800.00,
    '2025-04-05T23:59:59Z',
    'Owner has purchased required equipment',
    'Awaiting follow-up inspection to verify installation'
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_violations_address ON public.violations (address);
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.violations (status);
CREATE INDEX IF NOT EXISTS idx_violations_date_issued ON public.violations (date_issued);
