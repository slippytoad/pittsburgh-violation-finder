
/**
 * Utilities for synchronizing violation data from external APIs to our database
 */
import { supabase } from '@/utils/supabase';
import { transformViolationData } from '@/utils/violationTransformer';
import { ViolationType, WPRDCResponse, WPRDCViolation } from '@/utils/types';

// URL for the WPRDC API data source
const WPRDC_API_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const VIOLATION_RESOURCE_ID = '76fda9d0-69be-4dd5-8108-0de7907fc5a4';

/**
 * Fetch violations data from the WPRDC API
 * This can be run on a scheduled basis to keep our database updated
 */
export async function fetchLatestViolationsData(limit: number = 1000): Promise<WPRDCViolation[]> {
  try {
    console.log(`Fetching latest violations data (limit: ${limit})...`);
    
    const response = await fetch(`${WPRDC_API_URL}?resource_id=${VIOLATION_RESOURCE_ID}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json() as WPRDCResponse;
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    console.log(`Retrieved ${data.result.records.length} violations from WPRDC API`);
    return data.result.records;
  } catch (error) {
    console.error('Error fetching violations data:', error);
    throw error;
  }
}

/**
 * Update the violations database with the latest data
 */
export async function updateViolationsDatabase(violations: WPRDCViolation[]): Promise<number> {
  try {
    console.log(`Processing ${violations.length} violations for database update...`);
    
    // Transform the violations to match our database schema
    const transformedViolations = violations.map(violation => ({
      violation_id: violation.violation_id || violation.casefile_number,
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
    
    // Insert the violations with upsert to avoid duplicates
    const { data, error } = await supabase
      .from('violations')
      .upsert(transformedViolations, { 
        onConflict: 'violation_id',
        ignoreDuplicates: false // Update existing records
      });
      
    if (error) {
      console.error('Error updating violations database:', error);
      throw error;
    }
    
    return transformedViolations.length;
  } catch (error) {
    console.error('Error updating violations database:', error);
    throw error;
  }
}

/**
 * Synchronize the violations database with the latest data
 * This will be called on a scheduled basis
 */
export async function syncViolationsDatabase(): Promise<{ added: number }> {
  try {
    // Fetch the latest data
    const latestViolations = await fetchLatestViolationsData();
    
    // Update the database
    const added = await updateViolationsDatabase(latestViolations);
    
    return { added };
  } catch (error) {
    console.error('Error synchronizing violations database:', error);
    throw error;
  }
}
