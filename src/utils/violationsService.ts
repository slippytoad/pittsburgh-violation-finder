
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
    
    // Filter by date - checking both date_issued and created_at fields
    // This handles the case where the database might use either column
    query = query.or(`created_at.gte.${startDate},created_at.lte.${endDate}`);
    
    // Only add address filter if an address was provided
    if (cleanAddress !== '') {
      // Use ilike for case-insensitive partial matching
      query = query.ilike('address', `%${cleanAddress}%`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error querying violations:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} violations for address "${cleanAddress}"`);
    
    // If no data was returned, return an empty array
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filter the results by year based on created_at date
    // This is a fallback for databases that might not have the date_issued column
    const filteredByYear = data.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate.getFullYear() === year;
    });
    
    console.log(`After year filtering: ${filteredByYear.length} violations`);
    
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
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      // Use the first (most recent) record as the primary record
      const primaryRecord = records[0];
      
      return {
        id: id,
        address: primaryRecord.address || '',
        violationType: primaryRecord.violation_type || 'Unknown',
        dateIssued: primaryRecord.created_at || '',
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
          dateIssued: record.created_at || '',
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
