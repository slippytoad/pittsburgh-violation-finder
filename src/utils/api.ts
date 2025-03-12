
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
  investigation_date: string;
  parcel_id: string;
  inspection_result: string;
  agency_name: string;
  violation_description: string;
  casefile_number: string;
  address: string;
  status: string;
  violation_date: string;
  violation_code: string;
  violation_code_section: string;
  [key: string]: any; // For any additional fields in the API response
}

/**
 * Check if a date string is from the year 2025
 * @param dateString The date string to check
 * @returns True if the date is from 2025, false otherwise
 */
const isFrom2025 = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date.getFullYear() === 2025;
  } catch (e) {
    return false;
  }
};

/**
 * Search for violations by address
 * @param address The address to search for
 * @returns A promise that resolves to an array of violations
 */
export const searchViolationsByAddress = async (address: string): Promise<ViolationType[]> => {
  try {
    // Clean up and prepare the address for search
    const cleanAddress = address.trim();
    
    // Build the query - using just q= instead of q=address:
    // This searches across all fields instead of just the address field
    const query = cleanAddress;
    
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
    
    console.log('API Response:', data); // Log the API response for debugging
    
    // Map the API response to our ViolationType and filter for 2025 violations only
    return data.result.records
      .filter(record => {
        // Use investigation_date as priority, then fall back to others
        const dateToCheck = record.investigation_date || record.violation_date || record.inspection_date;
        return isFrom2025(dateToCheck);
      })
      .map(record => ({
        id: record.violation_id || record.casefile_number || String(record._id),
        address: record.address || '',
        violationType: record.violation_code_section || 'Unknown',
        dateIssued: record.investigation_date || record.violation_date || record.inspection_date || '',
        status: mapViolationStatus(record.status),
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
