
-- Function to find violations by address fragment
CREATE OR REPLACE FUNCTION find_violation_by_address(address_fragment TEXT, violation_type TEXT)
RETURNS TABLE (id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT v.id 
    FROM violations v
    WHERE v.address LIKE '%' || address_fragment || '%'
    AND (v.violation_type = violation_type OR violation_type IS NULL)
    ORDER BY v.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create the above function via RPC
CREATE OR REPLACE FUNCTION create_find_violation_function()
RETURNS boolean AS $$
BEGIN
    -- Create the function to find violations by address
    CREATE OR REPLACE FUNCTION find_violation_by_address(address_fragment TEXT, violation_type TEXT)
    RETURNS TABLE (id UUID) AS $inner$
    BEGIN
        RETURN QUERY
        SELECT v.id 
        FROM violations v
        WHERE v.address LIKE '%' || address_fragment || '%'
        AND (v.violation_type = violation_type OR violation_type IS NULL)
        ORDER BY v.created_at DESC
        LIMIT 1;
    END;
    $inner$ LANGUAGE plpgsql;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to fix _id column issue
CREATE OR REPLACE FUNCTION check_and_fix_id_column() 
RETURNS boolean AS $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if the _id column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'violations' 
        AND column_name = '_id'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- Add the _id column if it doesn't exist
        EXECUTE 'ALTER TABLE public.violations ADD COLUMN _id TEXT';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

