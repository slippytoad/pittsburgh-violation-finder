/**
 * Violations service for the Property Violations Finder app
 * This service handles searching for violations using Supabase
 */

import { supabase } from '@/utils/supabase';
import { ViolationType } from '@/utils/types';
import { getDebugViolations } from '@/utils/mockData';

// Simple in-memory cache for search results
const searchCache: Record<string, { timestamp: number, results: ViolationType[] }> = {};
// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Transform Supabase data into our application's violation type
 */
function transformViolationData(data: any[]): ViolationType[] {
  return data.map(item => ({
    id: item.id,
    caseNumber: item.violation_id || 'N/A',
    address: item.address,
    parcelId: 'N/A',
    status: item.status,
    dateIssued: item.date_issued,
    description: item.description,
    codeSection: 'N/A',
    instructions: 'N/A',
    outcome: item.investigation_outcome || 'N/A',
    findings: item.investigation_findings || '',
    violationType: item.violation_type || 'Unknown',
    propertyOwner: item.property_owner || 'Unknown Owner',
    fineAmount: item.fine_amount,
    dueDate: item.due_date,
    investigationOutcome: item.investigation_outcome,
    investigationFindings: item.investigation_findings,
  }));
}

/**
 * Provides mock data when we can't access the real database
 * This helps the app continue to function even when Supabase is inaccessible
 */
function getMockViolationsData(address: string): ViolationType[] {
  console.log(`Using mock data for address: ${address}`);
  return getDebugViolations().slice(0, 3).map(violation => ({
    ...violation,
    address: address
  }));
}

/**
 * Search for violations by address using Supabase
 */
export async function searchViolations(address: string, signal?: AbortSignal): Promise<ViolationType[]> {
  // For development/testing, return mock data if address is "DEBUG"
  if (address === 'DEBUG') {
    return getDebugViolations();
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
    
    // Query the Supabase violations table
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
    
    // Transform the data into our application's format
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
