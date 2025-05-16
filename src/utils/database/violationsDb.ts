
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
    
    // Transform the violations to match our database schema
    const transformedViolations = violations.map(violation => ({
      // Use _id directly from the API
      _id: violation._id?.toString() || violation.casefile_number,
      address: violation.address,
      violation_type: violation.agency_name || 'Unknown Type',
      investigation_date: violation.investigation_date || violation.inspection_date || new Date().toISOString(),
      status: violation.status || 'Unknown',
      original_status: violation.status || null,
      violation_description: violation.violation_description || '',
      property_owner: violation.owner_name || 'Unknown Owner',
      investigation_outcome: violation.investigation_outcome || null,
      investigation_findings: violation.investigation_findings || null,
      updated_at: new Date().toISOString()
    }));
    
    let addedCount = 0;
    
    // Process each violation
    for (const violation of transformedViolations) {
      try {
        // First try to find if a record with this _id already exists
        const { data: existingRecord, error: findError } = await supabase
          .from('violations')
          .select('_id')
          .eq('_id', violation._id)
          .maybeSingle();
          
        if (findError) {
          console.error(`Error finding violation with _id ${violation._id}:`, findError);
          continue;
        }
        
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('violations')
            .update(violation)
            .eq('_id', existingRecord._id);
            
          if (!updateError) {
            addedCount++;
          } else {
            console.error(`Error updating violation with _id ${violation._id}:`, updateError);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('violations')
            .insert(violation);
            
          if (!insertError) {
            addedCount++;
          } else {
            console.error(`Error inserting violation with _id ${violation._id}:`, insertError);
            
            // Fallback: try searching by address as a last resort
            const { data: addressResults, error: addressError } = await supabase
              .from('violations')
              .select('_id')
              .ilike('address', `%${violation.address.substring(0, 20)}%`)
              .limit(1);
              
            if (!addressError && addressResults && addressResults.length > 0) {
              // Update the existing record found by address
              const { error: finalUpdateError } = await supabase
                .from('violations')
                .update(violation)
                .eq('_id', addressResults[0]._id);
                
              if (!finalUpdateError) {
                addedCount++;
              }
            }
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
 * Helper function to create helper functions
 * This function is kept for backward compatibility but simplified
 */
export async function createHelperFunctions() {
  console.log('Helper functions no longer required as we use _id column directly');
  return true;
}
