
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
    
    // First, verify if the _id column exists
    const { error: columnCheckError } = await supabase.rpc('check_and_fix_id_column');
    if (columnCheckError) {
      console.error('Error checking/fixing _id column:', columnCheckError);
      // Continue anyway, we'll try to use other methods
    }
    
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
    
    // Try different approaches to update or insert records
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
          // Fallback: Try to find existing records by searching the violation description and address combo
          const { data: searchResults, error: searchError } = await supabase
            .from('violations')
            .select('id')
            .like('address', `%${violation.address.substring(0, 20)}%`)
            .limit(1);
            
          if (!searchError && searchResults && searchResults.length > 0) {
            // Update the existing record
            const { error: updateError } = await supabase
              .from('violations')
              .update({
                ...violation,
                _id: searchKey // Ensure _id column gets updated
              })
              .eq('id', searchResults[0].id);
              
            if (!updateError) {
              addedCount++;
              continue;
            }
          }
        }
        
        // Try one more approach - run a raw SQL query to check if record exists
        const { data: rawResults, error: rawError } = await supabase
          .rpc('find_violation_by_address', { 
            address_fragment: violation.address.substring(0, 20),
            violation_type: violation.violation_type
          });
        
        if (!rawError && rawResults && rawResults.id) {
          // Update with raw ID
          const { error: finalUpdateError } = await supabase
            .from('violations')
            .update(violation)
            .eq('id', rawResults.id);
            
          if (!finalUpdateError) {
            addedCount++;
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

// Helper RPC function to find violations by address fragment
// Add this as a Supabase function
export async function createHelperFunctions() {
  try {
    // Create a helper function to find violations by address
    const { error } = await supabase.rpc('create_find_violation_function');
    if (error) console.error('Error creating helper function:', error);
    return !error;
  } catch (e) {
    console.error('Error creating helper functions:', e);
    return false;
  }
}

