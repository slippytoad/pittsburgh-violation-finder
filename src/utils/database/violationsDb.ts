
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
    
    // Let's use a more reliable approach without relying on the _id column for querying
    // We'll instead try to find violations by their API id stored in the _id text field
    let addedCount = 0;
    
    for (const violation of transformedViolations) {
      // Use text field _id to find if violation already exists
      const { data: existingViolations, error: findError } = await supabase
        .from('violations')
        .select('id')
        .eq('_id', violation._id)
        .maybeSingle();
        
      if (findError && findError.code !== 'PGRST116') {
        console.log(`Error finding violation ${violation._id}:`, findError);
        continue;
      }
          
      if (existingViolations) {
        // Update the existing violation
        const { error: updateError } = await supabase
          .from('violations')
          .update(violation)
          .eq('id', existingViolations.id);
            
        if (updateError) {
          console.log(`Error updating violation ${violation._id}:`, updateError);
        } else {
          addedCount++;
        }
      } else {
        // Insert as new violation
        const { error: insertError } = await supabase
          .from('violations')
          .insert(violation);
            
        if (insertError) {
          console.log(`Error inserting violation ${violation._id}:`, insertError);
        } else {
          addedCount++;
        }
      }
    }
      
    return addedCount;
  } catch (error) {
    console.error('Error updating violations database:', error);
    throw error;
  }
}
