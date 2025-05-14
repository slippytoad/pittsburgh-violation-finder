
/**
 * API utilities for fetching data from the WPRDC API
 */
import { WPRDCResponse, WPRDCViolation } from '@/utils/types';

// URL for the WPRDC API data source
const WPRDC_API_URL = 'https://data.wprdc.org/api/3/action/datastore_search';
const WPRDC_SQL_API_URL = 'https://data.wprdc.org/api/3/action/datastore_search_sql';
const VIOLATION_RESOURCE_ID = '76fda9d0-69be-4dd5-8108-0de7907fc5a4';
// Add the correct table ID for SQL queries
const PLI_VIOLATIONS_TABLE_ID = '70c06278-92c5-4040-ab28-17671866f81c';

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
    
    console.log(`Fetching violations for ${addresses.length} addresses from WPRDC using SQL API...`);
    
    // Prepare the address conditions for the SQL WHERE clause
    // We'll create a condition like: address ILIKE '%123 Main%' OR address ILIKE '%456 Elm%'
    const addressConditions = addresses.map(address => {
      // Extract just the street part and clean it
      const streetPart = address.split(',')[0].trim().replace(/'/g, "''"); // Escape single quotes for SQL
      return `address ILIKE '%${streetPart}%'`;
    }).join(' OR ');
    
    // Build the SQL query using the correct table ID
    // Note: We're using template string to construct the SQL query with proper escaping
    const sqlQuery = `SELECT * FROM "${PLI_VIOLATIONS_TABLE_ID}" WHERE ${addressConditions} LIMIT 1000`;
    
    console.log('SQL Query:', sqlQuery);
    
    // Encode the SQL query for the URL
    const encodedSql = encodeURIComponent(sqlQuery);
    const queryUrl = `${WPRDC_SQL_API_URL}?sql=${encodedSql}`;
    
    const response = await fetch(queryUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json() as WPRDCResponse;
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    console.log(`Retrieved ${data.result.records.length} violations from WPRDC SQL API`);
    
    return data.result.records;
  } catch (error) {
    console.error('Error fetching violations for addresses:', error);
    throw error;
  }
}
