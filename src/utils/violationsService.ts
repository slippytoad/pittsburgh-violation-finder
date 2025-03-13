
/**
 * API service for the WPRDC Pittsburgh PLI Violations data
 * API Reference: https://data.wprdc.org/dataset/pittsburgh-pli-violations-report/resource/70c06278-92c5-4040-ab28-17671866f81c
 */

import { ViolationType, WPRDCResponse, WPRDCViolation } from './types';

const WPRDC_API_BASE_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const RESOURCE_ID = '70c06278-92c5-4040-ab28-17671866f81c';

/**
 * Check if a date string is from the specified year
 * @param dateString The date string to check
 * @param year The year to check against
 * @returns True if the date is from the specified year, false otherwise
 */
const isFromYear = (dateString: string, year: number): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date.getFullYear() === year;
  } catch (e) {
    return false;
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

/**
 * Get date timestamp for sorting, handling null/empty dates
 */
const getDateTimestamp = (dateString: string | null): number => {
  if (!dateString) return 0;
  try {
    return new Date(dateString).getTime();
  } catch (e) {
    return 0;
  }
};

/**
 * Search for violations by address
 * @param address The address to search for
 * @param year The year to filter violations by (default is 2025)
 * @returns A promise that resolves to an array of violations
 */
export const searchViolationsByAddress = async (address: string, year: number = 2025): Promise<ViolationType[]> => {
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
    
    // Filter records by the specified year
    const filteredRecords = data.result.records.filter(record => {
      // Use investigation_date as priority, then fall back to others
      const dateToCheck = record.investigation_date || record.violation_date || record.inspection_date;
      return isFromYear(dateToCheck, year);
    });
    
    // Create a map to group violations by case number
    const casefileMap = new Map<string, WPRDCViolation[]>();
    
    filteredRecords.forEach(record => {
      const caseNumber = record.casefile_number || String(record._id);
      if (!casefileMap.has(caseNumber)) {
        casefileMap.set(caseNumber, []);
      }
      casefileMap.get(caseNumber)?.push(record);
    });
    
    // Convert the grouped records into our ViolationType format
    const mergedViolations: ViolationType[] = Array.from(casefileMap.entries()).map(([caseNumber, records]) => {
      // Sort the records by investigation_date in descending order and then by _id descending
      records.sort((a, b) => {
        const dateA = getDateTimestamp(a.investigation_date || a.violation_date || a.inspection_date);
        const dateB = getDateTimestamp(b.investigation_date || b.violation_date || b.inspection_date);
        
        // First sort by date
        if (dateB !== dateA) {
          return dateB - dateA;
        }
        
        // If dates are equal, sort by ID
        const idA = a._id ? parseInt(String(a._id), 10) : 0;
        const idB = b._id ? parseInt(String(b._id), 10) : 0;
        return idB - idA;
      });
      
      // Use the first (most recent) record as the primary record
      const primaryRecord = records[0];
      
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
        investigationOutcome: primaryRecord.investigation_outcome || primaryRecord.inspection_result || null,
        investigationFindings: primaryRecord.investigation_findings || null,
        previousStatesCount: records.length > 1 ? records.length - 1 : null,
        previousStates: records.length > 1 ? records.slice(1).map((record, index) => ({
          id: `${caseNumber}-${index + 1}`,
          address: record.address || primaryRecord.address || '',
          violationType: record.violation_code_section || 'Unknown',
          dateIssued: record.investigation_date || record.violation_date || record.inspection_date || '',
          status: mapViolationStatus(record.status),
          description: record.violation_description || '',
          fineAmount: null,
          dueDate: null,
          propertyOwner: record.owner_name || primaryRecord.owner_name || 'Unknown',
          investigationOutcome: record.investigation_outcome || record.inspection_result || null,
          investigationFindings: record.investigation_findings || null
        })) : undefined
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
