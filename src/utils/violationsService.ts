
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
 * @param year The year to filter violations by
 * @returns A promise that resolves to an array of violations
 */
export const searchViolationsByAddress = async (address: string, year: number = new Date().getFullYear()): Promise<ViolationType[]> => {
  try {
    console.log(`Searching for violations at "${address}" in year ${year}`);
    
    // Clean up and prepare the address for search
    const cleanAddress = address.trim();
    
    // Create a year range for filtering
    const startDate = new Date(year, 0, 1).toISOString(); // January 1st of the year
    const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString(); // December 31st of the year
    
    // Build the query - search in the violations table
    let query = supabase
      .from('violations')
      .select('*');
    
    // Only add address filter if an address was provided
    if (cleanAddress !== '') {
      // Use broader matching by splitting the address and searching for partial matches
      const addressParts = cleanAddress.split(' ');
      
      // If we have multiple parts (like a number and street), search more precisely
      if (addressParts.length > 1) {
        // Create a more flexible search pattern with just the number and street name
        // This handles cases where the exact formatting differs
        query = query.ilike('address', `%${addressParts.slice(0, 2).join(' ')}%`);
        
        console.log(`Searching with flexible address pattern: %${addressParts.slice(0, 2).join(' ')}%`);
      } else {
        // Just use the original search if it's a single word
        query = query.ilike('address', `%${cleanAddress}%`);
        console.log(`Searching with simple address pattern: %${cleanAddress}%`);
      }
    }
    
    // Execute the query without date filtering first
    const { data, error } = await query;
    
    if (error) {
      console.error('Error querying violations:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} violations for address "${cleanAddress}" before filtering`);
    
    // If no data was returned, return an empty array
    if (!data || data.length === 0) {
      console.log(`No violations found for "${cleanAddress}". Query may need adjustment.`);
      return [];
    }
    
    // Log a sample of the returned data to help with debugging
    if (data.length > 0) {
      console.log('Sample violation data:', {
        id: data[0].id,
        address: data[0].address,
        investigation_date: data[0].investigation_date
      });
    }
    
    // Filter the results by year based on investigation_date
    let filteredByYear = data;
    
    // Only apply date filtering if a specific year was requested
    if (year) {
      filteredByYear = data.filter(record => {
        if (!record.investigation_date) return false;
        
        try {
          const recordDate = new Date(record.investigation_date);
          return recordDate.getFullYear() === year;
        } catch (e) {
          console.error('Invalid date format for record:', record, e);
          return false;
        }
      });
      
      console.log(`After year filtering: ${filteredByYear.length} violations for ${year}`);
    } else {
      console.log('No year filtering applied');
    }
    
    // Create a map to group violations by violation_id
    const violationMap = new Map<string, any[]>();
    
    filteredByYear.forEach(record => {
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
    return violations.sort((a, b) => {
      const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
      const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};
