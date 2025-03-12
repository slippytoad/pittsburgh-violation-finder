
/**
 * API service for the WPRDC Pittsburgh PLI Violations data
 * API Reference: https://data.wprdc.org/dataset/pittsburgh-pli-violations-report/resource/70c06278-92c5-4040-ab28-17671866f81c
 */

import { ViolationType } from './mockData';

const WPRDC_API_BASE_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const RESOURCE_ID = '70c06278-92c5-4040-ab28-17671866f81c';

interface WPRDCResponse {
  success: boolean;
  result: {
    records: WPRDCViolation[];
    total: number;
  };
}

interface WPRDCViolation {
  _id: number;
  violation_id: string;
  owner_name: string;
  inspection_date: string;
  parcel_id: string;
  inspection_result: string;
  agency_name: string;
  violation_description: string;
  inspection_street_number: string;
  inspection_street_name: string;
  inspection_street_suffix: string;
  inspection_city: string;
  inspection_state: string;
  inspection_zip: string;
  violation_status: string;
  violation_date: string;
  violation_code: string;
  [key: string]: any; // For any additional fields in the API response
}

/**
 * Search for violations by address
 * @param address The address to search for
 * @returns A promise that resolves to an array of violations
 */
export const searchViolationsByAddress = async (address: string): Promise<ViolationType[]> => {
  try {
    // Parse address to get street number and name for better search results
    const addressParts = address.split(' ');
    let streetNumber = '';
    let streetName = '';
    
    if (addressParts.length > 0 && !isNaN(Number(addressParts[0]))) {
      streetNumber = addressParts[0];
      streetName = addressParts.slice(1).join(' ').replace(',', '');
    }
    
    // Build the query
    let query = '';
    if (streetNumber && streetName) {
      query = `inspection_street_number:${streetNumber} AND inspection_street_name:${streetName.split(',')[0]}`;
    } else {
      // Fall back to a simpler query if we can't parse the address properly
      query = address.replace(/,/g, '');
    }
    
    // Build the URL with the query
    const url = new URL(WPRDC_API_BASE_URL);
    url.searchParams.append('resource_id', RESOURCE_ID);
    url.searchParams.append('q', query);
    url.searchParams.append('limit', '50');
    
    // Fetch the data
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data: WPRDCResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API request was not successful');
    }
    
    // Map the API response to our ViolationType
    return data.result.records.map(record => ({
      id: record.violation_id || String(record._id),
      address: `${record.inspection_street_number} ${record.inspection_street_name} ${record.inspection_street_suffix || ''}, ${record.inspection_city}, ${record.inspection_state} ${record.inspection_zip}`.trim(),
      violationType: record.violation_code || 'Unknown',
      dateIssued: record.violation_date || record.inspection_date || '',
      status: mapViolationStatus(record.violation_status),
      description: record.violation_description || '',
      fineAmount: null, // API doesn't provide fine amounts
      dueDate: null, // API doesn't provide due dates
      propertyOwner: record.owner_name || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};

/**
 * Map the API violation status to our status enum
 */
const mapViolationStatus = (status: string | null): 'Open' | 'Closed' | 'In Progress' => {
  if (!status) return 'Open';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('closed') || lowerStatus.includes('complied')) {
    return 'Closed';
  } else if (lowerStatus.includes('progress') || lowerStatus.includes('pending')) {
    return 'In Progress';
  } else {
    return 'Open';
  }
};
