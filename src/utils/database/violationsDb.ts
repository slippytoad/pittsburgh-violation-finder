
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
      // Using casefile_number as the primary identifier
      casefile_number: violation.violation_id || violation.casefile_number,
      address: violation.address,
      violation_type: violation.agency_name || 'Unknown Type',
      date_issued: violation.inspection_date || violation.investigation_date || new Date().toISOString(),
      status: violation.status || 'Unknown',
      original_status: violation.status || null,
      description: violation.violation_description || '',
      property_owner: violation.owner_name || 'Unknown Owner',
      fine_amount: null, // API doesn't provide this
      due_date: null, // API doesn't provide this
      investigation_outcome: violation.investigation_outcome || null,
      investigation_findings: violation.investigation_findings || null,
      updated_at: new Date().toISOString()
    }));
    
    // First check if we can use upsert with onConflict
    try {
      const { data: checkData, error: checkError } = await supabase
        .from('violations')
        .select('id')
        .eq('casefile_number', transformedViolations[0].casefile_number)
        .limit(1);
        
      if (checkError) {
        console.log('Error checking violation existence:', checkError);
      }
      
      // Try with insert, then update strategy instead of upsert
      for (const violation of transformedViolations) {
        // First try to find if this violation already exists
        const { data: existingViolation, error: findError } = await supabase
          .from('violations')
          .select('id')
          .eq('casefile_number', violation.casefile_number)
          .maybeSingle();
          
        if (findError && findError.code !== 'PGRST116') {
          console.log(`Error finding violation ${violation.casefile_number}:`, findError);
          continue;
        }
          
        if (existingViolation) {
          // Update the existing violation
          const { error: updateError } = await supabase
            .from('violations')
            .update(violation)
            .eq('id', existingViolation.id);
            
          if (updateError) {
            console.log(`Error updating violation ${violation.casefile_number}:`, updateError);
          }
        } else {
          // Insert as new violation
          const { error: insertError } = await supabase
            .from('violations')
            .insert(violation);
            
          if (insertError) {
            console.log(`Error inserting violation ${violation.casefile_number}:`, insertError);
          }
        }
      }
      
      return transformedViolations.length;
    } catch (error) {
      console.error('Error during individual violation processing:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating violations database:', error);
    throw error;
  }
}
