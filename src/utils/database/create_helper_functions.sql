
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
