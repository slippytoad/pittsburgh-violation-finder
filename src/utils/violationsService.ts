
/**
 * Service for accessing violations data from the Supabase database
 */

import { ViolationType } from './types';
import { supabase } from './supabase';

/**
 * Map the database violation status to our status enum
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
 * Search for violations by address
 * @param address The address to search for
 * @returns A promise that resolves to an array of violations
 */
export const searchViolationsByAddress = async (address: string): Promise<ViolationType[]> => {
  try {
    console.log(`Starting search for violations at "${address}"`);
    
    // Clean up and prepare the address for search
    const cleanAddress = address.trim().toUpperCase();
    
    // Log the database request
    console.log('Querying Supabase for violations...');

    // First get all violations to check if our database has any data at all
    const { data: allViolations, error: allError } = await supabase
      .from('violations')
      .select('*')
      .limit(5);

    if (allError) {
      console.error('Error querying all violations:', allError);
      throw allError;
    }

    console.log(`Database has ${allViolations?.length || 0} violations (sample check)`);
    
    if (allViolations && allViolations.length > 0) {
      console.log('Sample violation record:', allViolations[0]);
    } else {
      console.warn('No violations found in the database at all!');
    }

    // Now perform the actual search with address
    let query = supabase
      .from('violations')
      .select('*');
    
    // Only add address filter if an address was provided
    if (cleanAddress !== '') {
      // Try multiple matching approaches for maximum flexibility
      
      // First, normalize the address format - remove special characters
      const normalizedAddress = cleanAddress.replace(/[^\w\s]/gi, '');
      
      // Extract first part of address (usually the number)
      const addressParts = normalizedAddress.split(' ');
      const addressNumber = addressParts.length > 0 ? addressParts[0] : '';
      
      // Extract street name if available
      const streetName = addressParts.length > 1 ? addressParts[1] : '';
      
      console.log(`Searching with normalized address: "${normalizedAddress}"`);
      console.log(`Address number: "${addressNumber}", Street name: "${streetName}"`);
      
      if (addressNumber && streetName) {
        // If we have both number and street name, search for them separately
        // This is more flexible than searching for the whole address
        query = query.or(`address.ilike.%${addressNumber}%,address.ilike.%${streetName}%`);
        console.log(`Using flexible search with number and street separately`);
      } else {
        // Just use the full address for search
        query = query.ilike('address', `%${normalizedAddress}%`);
        console.log(`Using simple address pattern: %${normalizedAddress}%`);
      }
    }
    
    // Debug query to see all data without filtering by address
    if (cleanAddress === 'DEBUG') {
      query = supabase.from('violations').select('*').limit(100);
      console.log('DEBUG MODE: Returning all violations up to 100');
    }
    
    // Log query details for debugging - without using toSQL() which doesn't exist
    console.log('Executing Supabase query with filters:', {
      table: 'violations',
      addressFilter: cleanAddress !== '' ? `ilike %${cleanAddress}%` : 'none'
    });
    
    // Execute the query
    const { data: matchingRecords, error } = await query;
    
    if (error) {
      console.error('Error querying violations:', error);
      throw error;
    }
    
    // Log raw response data for debugging - limiting the size for readability
    if (matchingRecords && matchingRecords.length > 0) {
      console.log('Raw database response (first record):', JSON.stringify(matchingRecords[0]));
      console.log(`Additional records: ${matchingRecords.length - 1} more`);
    } else {
      console.log('Raw database response: no records found');
    }
    
    console.log(`Found ${matchingRecords?.length || 0} violations for address "${cleanAddress}"`);
    
    // If no data was returned, return an empty array
    if (!matchingRecords || matchingRecords.length === 0) {
      console.log(`No violations found for "${cleanAddress}". Query may need adjustment.`);
      return [];
    }
    
    // Log a sample of the returned data to help with debugging
    if (matchingRecords.length > 0) {
      console.log('Sample matched violation:', {
        id: matchingRecords[0].id,
        address: matchingRecords[0].address,
        violation_id: matchingRecords[0].violation_id,
        investigation_date: matchingRecords[0].investigation_date
      });
    }
    
    // Create a map to group violations by violation_id
    const violationMap = new Map<string, any[]>();
    
    matchingRecords.forEach(record => {
      const violationId = record.violation_id || String(record.id);
      if (!violationMap.has(violationId)) {
        violationMap.set(violationId, []);
      }
      violationMap.get(violationId)?.push(record);
    });
    
    // Convert the grouped records into our ViolationType format
    const violations: ViolationType[] = Array.from(violationMap.entries()).map(([id, records]) => {
      // Sort records by date in descending order
      records.sort((a, b) => {
        const dateA = new Date(a.investigation_date || 0).getTime();
        const dateB = new Date(b.investigation_date || 0).getTime();
        return dateB - dateA;
      });
      
      // Use the first (most recent) record as the primary record
      const primaryRecord = records[0];
      
      return {
        id: id,
        address: primaryRecord.address || '',
        violationType: primaryRecord.violation_type || 'Unknown',
        dateIssued: primaryRecord.investigation_date || '',
        status: mapViolationStatus(primaryRecord.status),
        originalStatus: primaryRecord.original_status || primaryRecord.status || '',
        description: primaryRecord.description || '',
        fineAmount: primaryRecord.fine_amount || null,
        dueDate: primaryRecord.due_date || null,
        propertyOwner: primaryRecord.property_owner || 'Unknown',
        investigationOutcome: primaryRecord.investigation_outcome || null,
        investigationFindings: primaryRecord.investigation_findings || null,
        previousStatesCount: records.length > 1 ? records.length - 1 : null,
        previousStates: records.length > 1 ? records.slice(1).map((record, index) => ({
          id: `${id}-${index + 1}`,
          address: record.address || '',
          violationType: record.violation_type || 'Unknown',
          dateIssued: record.investigation_date || '',
          status: mapViolationStatus(record.status),
          originalStatus: record.original_status || record.status || '',
          description: record.description || '',
          fineAmount: record.fine_amount || null,
          dueDate: record.due_date || null,
          propertyOwner: record.property_owner || 'Unknown',
          investigationOutcome: record.investigation_outcome || null,
          investigationFindings: record.investigation_findings || null
        })) : undefined
      };
    });
    
    // Sort the final list by date (descending)
    const sortedViolations = violations.sort((a, b) => {
      const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
      const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
      return dateB - dateA;
    });
    
    console.log(`Returning ${sortedViolations.length} violations after processing`);
    return sortedViolations;
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};
