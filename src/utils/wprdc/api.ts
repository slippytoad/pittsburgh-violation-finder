
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
    
    // Instead of using complex filtering, we'll fetch a larger dataset
    // and filter it on our side
    const response = await fetch(`${WPRDC_API_URL}?resource_id=${VIOLATION_RESOURCE_ID}&limit=5000`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json() as WPRDCResponse;
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    const allViolations = data.result.records;
    console.log(`Retrieved ${allViolations.length} total violations from WPRDC API`);
    
    // Normalize addresses for more flexible matching
    const normalizedAddresses = addresses.map(address => 
      address.toLowerCase().replace(/\s+/g, ' ').trim()
    );
    
    // Filter violations that match any of our addresses
    const filteredViolations = allViolations.filter(violation => {
      if (!violation.address) return false;
      
      // Normalize the violation address for comparison
      const violationAddress = violation.address.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Check if any of our normalized addresses is included in this violation address
      return normalizedAddresses.some(addr => {
        const streetPart = addr.split(',')[0].trim();
        return violationAddress.includes(streetPart);
      });
    });
    
    console.log(`Filtered to ${filteredViolations.length} relevant violations for the provided addresses`);
    
    return filteredViolations;
  } catch (error) {
    console.error('Error fetching violations for addresses:', error);
    throw error;
  }
}
