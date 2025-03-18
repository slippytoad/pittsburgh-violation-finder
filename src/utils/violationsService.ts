
/**
 * API service for the WPRDC Pittsburgh PLI Violations data
 * API Reference: https://data.wprdc.org/dataset/pittsburgh-pli-violations-report/resource/70c06278-92c5-4040-ab28-17671866f81c
 */

import { ViolationType } from '@/utils/types';
import { getDebugViolations } from '@/utils/mockData';

// API endpoint for the WPRDC data
const WPRDC_API_BASE_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
// Resource ID for the PLI Violations dataset
const RESOURCE_ID = '70c06278-92c5-4040-ab28-17671866f81c';
// Max results to return per query
const LIMIT = 200;

/**
 * Transform the raw API response into our application's violation type
 */
function transformViolationData(data: any[]): ViolationType[] {
  return data.map(item => ({
    id: item._id.toString(),
    caseNumber: item.casefile_number,
    address: item.address,
    parcelId: item.parcel_id,
    status: item.status,
    dateIssued: item.investigation_date,
    description: item.violation_description,
    codeSection: item.violation_code_section,
    instructions: item.violation_spec_instructions,
    outcome: item.investigation_outcome,
    findings: item.investigation_findings || '',
    // Add the missing required properties from ViolationType
    violationType: item.violation_code_section || 'Unknown',
    propertyOwner: item.owner_name || 'Unknown Owner',
    fineAmount: null,
    dueDate: null,
  }));
}

/**
 * Search for violations by address
 */
export async function searchViolationsByAddress(address: string, signal?: AbortSignal): Promise<ViolationType[]> {
  // For development/testing, return mock data if address is "DEBUG"
  if (address === 'DEBUG') {
    return getDebugViolations();
  }
  
  try {
    // Clean up and prepare the address for search
    const cleanAddress = address.trim();
    
    // Build the URL with the query - using simpler SELECT *
    const url = new URL(WPRDC_API_BASE_URL);
    url.searchParams.append('resource_id', RESOURCE_ID);
    url.searchParams.append('q', cleanAddress);
    url.searchParams.append('limit', LIMIT.toString());
    
    // Make the API request
    console.log(`Fetching violations for address: ${cleanAddress}`);
    const response = await fetch(url.toString(), { signal });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API reported an unsuccessful request');
    }
    
    const records = data.result.records || [];
    console.log(`Found ${records.length} violation records`);
    
    // Transform the data into our application's format
    return transformViolationData(records);
    
  } catch (error) {
    // Re-throw AbortError to be handled by the caller
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('Error searching violations by address:', error);
    throw new Error(`Failed to search for violations: ${error.message}`);
  }
}
