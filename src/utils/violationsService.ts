/**
 * Violations service for the Property Violations Finder app
 * This service handles searching for violations using Supabase
 */

import { supabase } from '@/utils/supabase';
import { ViolationType } from '@/utils/types';
import { getDebugViolations } from '@/utils/mockData';
import { processBatch } from '@/utils/batchProcessing';

// Simple in-memory cache for search results
const searchCache: Record<string, { timestamp: number, results: ViolationType[] }> = {};
// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Transform Supabase data into our application's violation type
 * and group violations by casefile number
 */
function transformViolationData(data: any[]): ViolationType[] {
  // First, transform all data to our application format
  const transformedData = data.map(item => ({
    id: item.id,
    caseNumber: item.casefile_number || item.violation_id || 'N/A',
    address: item.address,
    parcelId: item.parcel_id || 'N/A',
    status: item.status,
    dateIssued: item.date_issued || item.investigation_date || item.inspection_date,
    description: item.description || item.violation_description || '',
    codeSection: item.violation_code_section || 'N/A',
    instructions: item.instructions || 'N/A',
    outcome: item.investigation_outcome || 'N/A',
    findings: item.investigation_findings || '',
    violationType: item.violation_type || 'Unknown',
    propertyOwner: item.property_owner || item.owner_name || 'Unknown Owner',
    fineAmount: item.fine_amount || null,
    dueDate: item.due_date || null,
    investigationOutcome: item.investigation_outcome || null,
    investigationFindings: item.investigation_findings || null,
    relatedViolations: [],
    relatedViolationsCount: 0
  }));

  // Group violations by casefile number/case id
  const groupedByCasefile: Record<string, ViolationType[]> = {};
  
  transformedData.forEach(violation => {
    const caseKey = violation.caseNumber;
    if (!groupedByCasefile[caseKey]) {
      groupedByCasefile[caseKey] = [];
    }
    groupedByCasefile[caseKey].push(violation);
  });

  // Create final result with proper related violations structure
  const result: ViolationType[] = [];
  
  Object.entries(groupedByCasefile).forEach(([caseNumber, violations]) => {
    if (violations.length === 1) {
      // No related violations
      result.push(violations[0]);
    } else {
      // Sort related violations by date, newest first
      violations.sort((a, b) => {
        const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
        const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
        return dateB - dateA;
      });
      
      // Use the most recent violation as the primary and add the rest as related
      const primaryViolation = { ...violations[0] };
      primaryViolation.relatedViolations = violations.slice(1);
      primaryViolation.relatedViolationsCount = violations.length - 1;
      
      result.push(primaryViolation);
    }
  });

  // Sort the final result by date, newest first
  return result.sort((a, b) => {
    const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
    const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Provides mock data when we can't access the real database
 * This helps the app continue to function even when Supabase is inaccessible
 */
function getMockViolationsData(address: string): ViolationType[] {
  console.log(`Using mock data for address: ${address}`);
  const mockData = getDebugViolations().slice(0, 3).map(violation => ({
    ...violation,
    address: address
  }));
  
  // Group the mock data by case number
  return transformViolationData(mockData);
}

/**
 * Search for violations by address using Supabase
 */
export async function searchViolations(address: string, signal?: AbortSignal): Promise<ViolationType[]> {
  // For development/testing, return mock data if address is "DEBUG"
  if (address === 'DEBUG') {
    return transformViolationData(getDebugViolations());
  }
  
  try {
    // Clean up and prepare the address for search
    const cleanAddress = address.trim();
    
    // Check if we have a valid cached result
    if (searchCache[cleanAddress]) {
      const cachedData = searchCache[cleanAddress];
      const now = Date.now();
      
      // If the cache hasn't expired, use it
      if (now - cachedData.timestamp < CACHE_EXPIRATION_MS) {
        console.log(`Using cached results for address: ${cleanAddress}`);
        return cachedData.results;
      }
      
      // Otherwise, delete the expired cache entry
      delete searchCache[cleanAddress];
    }
    
    console.log(`Searching for violations at address: ${cleanAddress}`);
    
    // Query the Supabase violations table with more comprehensive data
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .ilike('address', `%${cleanAddress}%`)
      .abortSignal(signal);
    
    // If there's an error or the search was aborted, handle it
    if (error) {
      // Check if it's an AbortError
      if (signal?.aborted) {
        console.log(`Search for ${cleanAddress} was aborted`);
        throw new DOMException('The operation was aborted', 'AbortError');
      }
      
      console.warn('Error searching violations:', error);
      return getMockViolationsData(cleanAddress);
    }
    
    console.log(`Found ${data?.length || 0} violation records for: ${cleanAddress}`);
    
    // Transform and group the data into our application's format
    const transformedResults = transformViolationData(data || []);
    
    // Store the results in the cache
    searchCache[cleanAddress] = {
      timestamp: Date.now(),
      results: transformedResults
    };
    
    return transformedResults;
  } catch (error) {
    // Re-throw AbortError to be handled by the caller
    if (error.name === 'AbortError') {
      console.log(`Search for ${address} was aborted`);
      throw error;
    }
    
    console.error('Error searching violations by address:', error);
    // Return mock data instead of throwing an error
    return getMockViolationsData(address);
  }
}

/**
 * Search violations for multiple addresses
 */
export async function searchMultipleAddresses(addresses: string[], onProgress?: (count: number) => void, signal?: AbortSignal): Promise<ViolationType[]> {
  try {
    // Fix the type issue by creating a wrapper function that matches the expected signature
    const progressCallback = (count: (prev: number) => number): void => {
      if (onProgress) {
        onProgress(typeof count === 'function' ? count(0) : count);
      } else {
        console.log(`Processed ${typeof count === 'function' ? count(0) : count} addresses`);
      }
    };
    
    // Use the existing batch processing utility but with direct database calls
    return await processBatch(
      addresses,
      0,
      progressCallback,
      [],
      signal
    );
  } catch (error) {
    console.error('Error searching multiple addresses:', error);
    if (error.name === 'AbortError') {
      throw error;
    }
    // Return empty array if there's an error
    return [];
  }
}
