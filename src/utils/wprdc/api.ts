
/**
 * API utilities for fetching data from the WPRDC API
 */
import { WPRDCResponse, WPRDCViolation } from '@/utils/types';

// URL for the WPRDC API data source
const WPRDC_API_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const VIOLATION_RESOURCE_ID = '76fda9d0-69be-4dd5-8108-0de7907fc5a4';

/**
 * Fetch violations data from the WPRDC API
 * This can be run on a scheduled basis to keep our database updated
 */
export async function fetchLatestViolationsData(limit: number = 1000): Promise<WPRDCViolation[]> {
  try {
    console.log(`Fetching latest violations data (limit: ${limit})...`);
    
    const response = await fetch(`${WPRDC_API_URL}?resource_id=${VIOLATION_RESOURCE_ID}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json() as WPRDCResponse;
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    console.log(`Retrieved ${data.result.records.length} violations from WPRDC API`);
    return data.result.records;
  } catch (error) {
    console.error('Error fetching violations data:', error);
    throw error;
  }
}

/**
 * Fetch violations from WPRDC API for specific addresses
 * @param addresses List of addresses to fetch violations for
 * @returns Array of violations matching the addresses
 */
export async function fetchViolationsForAddresses(addresses: string[]): Promise<WPRDCViolation[]> {
  try {
    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses provided');
    }
    
    console.log(`Fetching violations for ${addresses.length} addresses from WPRDC...`);
    
    // Prepare list of normalized addresses for more flexible matching
    const normalizedAddresses = addresses.map(address => 
      address.toLowerCase().replace(/\s+/g, ' ').trim()
    );
    
    // Create a filter string using the format expected by the WPRDC API
    // The API expects filters in {"field_name": "value"} format
    const filters = {
      "address": {
        // Use $ilike for case-insensitive partial matches
        "$ilike": normalizedAddresses.map(addr => `%${addr}%`)
      }
    };
    
    // Convert the filter object to a JSON string
    const filterJson = JSON.stringify(filters);
    
    // Build the query URL with the JSON filter
    const queryUrl = `${WPRDC_API_URL}?resource_id=${VIOLATION_RESOURCE_ID}&limit=1000&filters=${encodeURIComponent(filterJson)}`;
    
    console.log('WPRDC Query URL:', queryUrl);
    
    const response = await fetch(queryUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json() as WPRDCResponse;
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    const violations = data.result.records;
    console.log(`Retrieved ${violations.length} violations from WPRDC API for the specified addresses`);
    
    // Now filter more precisely by checking each violation against our addresses
    const filteredViolations = violations.filter(violation => {
      if (!violation.address) return false;
      
      // Normalize the violation address
      const normalizedViolationAddress = violation.address.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Check if any of our normalized addresses is included in this violation address
      return normalizedAddresses.some(addr => {
        // Get the base street part (e.g. "123 Main St" from "123 Main St, Pittsburgh, PA")
        const streetPart = addr.split(',')[0].trim();
        return normalizedViolationAddress.includes(streetPart);
      });
    });
    
    console.log(`Filtered to ${filteredViolations.length} relevant violations`);
    
    return filteredViolations;
  } catch (error) {
    console.error('Error fetching violations for addresses:', error);
    throw error;
  }
}
