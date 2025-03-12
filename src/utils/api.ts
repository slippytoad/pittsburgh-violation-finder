
/**
 * API service for the WPRDC Pittsburgh PLI Violations data
 * API Reference: https://data.wprdc.org/dataset/pittsburgh-pli-violations-report/resource/70c06278-92c5-4040-ab28-17671866f81c
 */

import { ViolationType } from './mockData';

const WPRDC_API_BASE_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const RESOURCE_ID = '70c06278-92c5-4040-ab28-17671866f81c';

// Mock database for addresses
let savedAddresses: string[] = [];

// Mock API functions for address management
export const fetchSavedAddresses = async (): Promise<string[]> => {
  return savedAddresses;
};

export const saveAddress = async (address: string): Promise<string[]> => {
  if (!savedAddresses.includes(address)) {
    savedAddresses = [...savedAddresses, address];
  }
  return savedAddresses;
};

export const removeAddress = async (index: number): Promise<string[]> => {
  savedAddresses = savedAddresses.filter((_, i) => i !== index);
  return savedAddresses;
};

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
    
    // Filter for 2025 violations only
    const filtered2025Records = data.result.records.filter(record => {
      // Use investigation_date as priority, then fall back to others
      const dateToCheck = record.investigation_date || record.violation_date || record.inspection_date;
      return isFrom2025(dateToCheck);
    });
    
    // Create a map to group violations by case number
    const casefileMap = new Map<string, WPRDCViolation[]>();
    
    filtered2025Records.forEach(record => {
      const caseNumber = record.casefile_number || String(record._id);
      if (!casefileMap.has(caseNumber)) {
        casefileMap.set(caseNumber, []);
      }
      casefileMap.get(caseNumber)?.push(record);
    });
    
    // Convert the grouped records into our ViolationType format
    const mergedViolations: ViolationType[] = Array.from(casefileMap.entries()).map(([caseNumber, records]) => {
      // Sort the records by investigation_date in descending order
      records.sort((a, b) => {
        const dateA = a.investigation_date ? new Date(a.investigation_date).getTime() : 0;
        const dateB = b.investigation_date ? new Date(b.investigation_date).getTime() : 0;
        return dateB - dateA;
      });
      
      // Use the first (most recent) record as the primary record
      const primaryRecord = records[0];
      
      // If there are multiple violations, add them as related violations
      const relatedViolations = records.length > 1 
        ? records.slice(1).map((record, index) => ({
            id: `${caseNumber}-${index + 1}`,
            address: record.address || primaryRecord.address || '',
            violationType: record.violation_code_section || 'Unknown',
            dateIssued: record.investigation_date || record.violation_date || record.inspection_date || '',
            status: mapViolationStatus(record.status),
            description: record.violation_description || '',
            fineAmount: null,
            dueDate: null,
            propertyOwner: record.owner_name || primaryRecord.owner_name || 'Unknown'
          })) 
        : undefined;
      
      // Return the merged violation
      return {
        id: caseNumber,
        address: primaryRecord.address || '',
        violationType: primaryRecord.violation_code_section || 'Unknown',
        dateIssued: primaryRecord.investigation_date || primaryRecord.violation_date || primaryRecord.inspection_date || '',
        status: mapViolationStatus(primaryRecord.status),
        description: primaryRecord.violation_description || '',
        fineAmount: null, // API doesn't provide fine amounts
        dueDate: null, // API doesn't provide due dates
        propertyOwner: primaryRecord.owner_name || 'Unknown',
        relatedViolationsCount: records.length > 1 ? records.length - 1 : null,
        relatedViolations: relatedViolations
      };
    });
    
    // Sort the final list by investigation date (descending)
    return mergedViolations.sort((a, b) => {
      const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
      const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
      return dateB - dateA;
    });
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
