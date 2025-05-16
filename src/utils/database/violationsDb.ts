
/**
 * Database operations for violations
 */
import { supabase } from '@/utils/supabase';
import { WPRDCViolation } from '@/utils/types';

/**
 * Update the violations database with the latest data
 */
export async function updateViolationsDatabase(violations: WPRDCViolation[]): Promise<number> {
  try {
    console.log(`Processing ${violations.length} violations for database update...`);
    
    if (violations.length === 0) {
      console.log('No violations to update.');
      return 0;
    }
    
    // First, ensure helper functions exist
    await ensureDatabaseHelperFunctions();
    
    // Transform the violations to match our database schema
    const transformedViolations = violations.map(violation => ({
      // Make sure to use _id from the API as _id in our database
      _id: violation._id?.toString() || violation.casefile_number,
      address: violation.address,
      violation_type: violation.agency_name || 'Unknown Type',
      investigation_date: violation.investigation_date || violation.inspection_date || new Date().toISOString(),
      status: violation.status || 'Unknown',
      original_status: violation.status || null,
      violation_description: violation.violation_description || '',
      property_owner: violation.owner_name || 'Unknown Owner',
      fine_amount: null, // API doesn't provide this
      due_date: null, // API doesn't provide this
      investigation_outcome: violation.investigation_outcome || null,
      investigation_findings: violation.investigation_findings || null,
      updated_at: new Date().toISOString()
    }));
    
    let addedCount = 0;
    
    // Process each violation with careful error handling
    for (const violation of transformedViolations) {
      // Create a custom ID search key - for cases when _id column isn't working
      const searchKey = violation._id;
      
      try {
        // First approach: direct insertion (handles new records)
        const { data: insertResult, error: insertError } = await supabase
          .from('violations')
          .insert({ ...violation })
          .select('id');
          
        if (!insertError) {
          addedCount++;
          continue; // Record added successfully
        }
        
        // If insertion failed due to duplicate, try updating
        if (insertError && insertError.code === '23505') { // Duplicate key value violates unique constraint
          // Find by address search using direct SQL query
          const { data: addressResults, error: addressError } = await supabase
            .from('violations')
            .select('id')
            .ilike('address', `%${violation.address.substring(0, 20)}%`)
            .limit(1);
            
          if (!addressError && addressResults && addressResults.length > 0) {
            // Update the existing record
            const { error: updateError } = await supabase
              .from('violations')
              .update({
                ...violation
              })
              .eq('id', addressResults[0].id);
              
            if (!updateError) {
              addedCount++;
              continue;
            }
          }
          
          // Try using our custom function if available
          try {
            const { data: fnResults, error: fnError } = await supabase
              .rpc('find_violation_by_address', { 
                address_fragment: violation.address.substring(0, 20),
                violation_type: violation.violation_type
              });
            
            if (!fnError && fnResults) {
              const { error: finalUpdateError } = await supabase
                .from('violations')
                .update(violation)
                .eq('id', fnResults);
                
              if (!finalUpdateError) {
                addedCount++;
              }
            }
          } catch (fnCallError) {
            console.error('Error calling find_violation_by_address function:', fnCallError);
          }
        }
      } catch (innerError) {
        console.error(`Error processing violation ${violation._id}:`, innerError);
      }
    }
      
    return addedCount;
  } catch (error) {
    console.error('Error updating violations database:', error);
    throw error;
  }
}

/**
 * Ensures all required database helper functions exist
 */
async function ensureDatabaseHelperFunctions(): Promise<boolean> {
  try {
    // Create helper functions
    await createHelperFunctions();
    
    // Ensure _id column exists
    await ensureIdColumnExists();
    
    return true;
  } catch (error) {
    console.error('Error ensuring database helper functions:', error);
    return false;
  }
}

/**
 * Ensures the _id column exists in the violations table
 */
async function ensureIdColumnExists(): Promise<boolean> {
  try {
    // Try to call the stored procedure
    const { error } = await supabase.rpc('check_and_fix_id_column');
    
    if (error) {
      console.warn('Failed to call check_and_fix_id_column procedure:', error);
      
      // Direct SQL fallback approach if the function doesn't exist
      try {
        // Use raw SQL to check if column exists
        const { data: columnCheckData } = await supabase
          .from('violations')
          .select('_id')
          .limit(1);
          
        // If we reach here, the column exists
        console.log('_id column check via direct query succeeded');
        return true;
      } catch (directCheckError) {
        // If this fails, try to add the column directly
        try {
          // This requires admin privileges which client-side might not have
          const { error: alterError } = await supabase.rpc(
            'run_sql',
            { sql: 'ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS _id TEXT;' }
          );
          
          if (alterError) {
            console.error('Failed to add _id column directly:', alterError);
            return false;
          }
          
          console.log('Added _id column via direct SQL');
          return true;
        } catch (alterTableError) {
          console.error('Failed to alter table:', alterTableError);
          return false;
        }
      }
    }
    
    console.log('_id column check successful');
    return true;
  } catch (e) {
    console.error('Error checking/fixing _id column:', e);
    return false;
  }
}

// Helper RPC function to find violations by address fragment
export async function createHelperFunctions() {
  try {
    // Create a helper function to find violations by address
    const { error } = await supabase.rpc('create_find_violation_function');
    if (error) {
      console.warn('Error creating find_violation helper function:', error);
      
      // Try direct function creation
      try {
        const findViolationFnSql = `
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
        `;
        
        const { error: directError } = await supabase.rpc('run_sql', { sql: findViolationFnSql });
        if (directError) {
          console.error('Failed to create find_violation function directly:', directError);
          return false;
        }
      } catch (directCreateError) {
        console.error('Error in direct function creation:', directCreateError);
        return false;
      }
    }
    
    // Create the check_and_fix_id_column function
    try {
      const checkIdColumnFnSql = `
      CREATE OR REPLACE FUNCTION check_and_fix_id_column() 
      RETURNS boolean AS $$
      DECLARE
          column_exists boolean;
      BEGIN
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
      `;
      
      const { error: idColumnFnError } = await supabase.rpc('run_sql', { sql: checkIdColumnFnSql });
      if (idColumnFnError) {
        console.error('Failed to create check_and_fix_id_column function:', idColumnFnError);
      }
    } catch (idColumnFnCreateError) {
      console.error('Error creating check_and_fix_id_column function:', idColumnFnCreateError);
    }
    
    return true;
  } catch (e) {
    console.error('Error creating helper functions:', e);
    return false;
  }
}
