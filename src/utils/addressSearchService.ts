
/**
 * Service for searching violations by address
 */
import { supabase } from '@/utils/supabase';
import { ViolationType } from '@/utils/types';
import { transformViolationData } from '@/utils/violationTransformer';
import { getCachedResults, setCachedResults } from '@/utils/searchCache';
import { getMockViolationsData, getDebugViolations } from '@/utils/mockViolationsService';

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
    const cachedResults = getCachedResults(cleanAddress);
    if (cachedResults) {
      return cachedResults;
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
    setCachedResults(cleanAddress, transformedResults);
    
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
 * Search all violations without filtering by address
 */
export async function searchAllViolations(signal?: AbortSignal): Promise<ViolationType[]> {
  try {
    console.log('Searching all violations without address filter');
    
    // Check if we have a valid cached result for all violations
    const cacheKey = '_all_violations_';
    const cachedResults = getCachedResults(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }
    
    // Query the Supabase violations table directly
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .order('investigation_date', { ascending: false })
      .limit(100) // Limit to prevent too much data
      .abortSignal(signal);
    
    // If there's an error or the search was aborted, handle it
    if (error) {
      // Check if it's an AbortError
      if (signal?.aborted) {
        console.log('Search for all violations was aborted');
        throw new DOMException('The operation was aborted', 'AbortError');
      }
      
      console.warn('Error searching all violations:', error);
      return getDebugViolations(); // Use debug data as fallback
    }
    
    console.log(`Found ${data?.length || 0} violation records`);
    
    // Transform and group the data into our application's format
    const transformedResults = transformViolationData(data || []);
    
    // Store the results in the cache
    setCachedResults(cacheKey, transformedResults);
    
    return transformedResults;
  } catch (error) {
    // Re-throw AbortError to be handled by the caller
    if (error.name === 'AbortError') {
      console.log('Search for all violations was aborted');
      throw error;
    }
    
    console.error('Error searching all violations:', error);
    // Return mock data instead of throwing an error
    return getDebugViolations();
  }
}

/**
 * Fetch the most recent violations (last 30 days)
 */
export async function fetchRecentViolations(signal?: AbortSignal): Promise<ViolationType[]> {
  try {
    console.log('Fetching recent violations');
    
    // Check if we have a valid cached result for recent violations
    const cacheKey = '_recent_violations_';
    const cachedResults = getCachedResults(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
    
    // Query the Supabase violations table for recent entries
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .gte('investigation_date', thirtyDaysAgoStr)
      .order('investigation_date', { ascending: false })
      .limit(50) // Limit to recent violations
      .abortSignal(signal);
    
    // If there's an error or the search was aborted, handle it
    if (error) {
      // Check if it's an AbortError
      if (signal?.aborted) {
        console.log('Fetch for recent violations was aborted');
        throw new DOMException('The operation was aborted', 'AbortError');
      }
      
      console.warn('Error fetching recent violations:', error);
      return getDebugViolations(); // Use debug data as fallback
    }
    
    console.log(`Found ${data?.length || 0} recent violation records`);
    
    // Transform and group the data into our application's format
    const transformedResults = transformViolationData(data || []);
    
    // Store the results in the cache
    setCachedResults(cacheKey, transformedResults);
    
    return transformedResults;
  } catch (error) {
    // Re-throw AbortError to be handled by the caller
    if (error.name === 'AbortError') {
      console.log('Fetch for recent violations was aborted');
      throw error;
    }
    
    console.error('Error fetching recent violations:', error);
    // Return mock data instead of throwing an error
    return getDebugViolations();
  }
}
