
/**
 * Main synchronization utilities that combine API fetching and database operations
 */
import { fetchLatestViolationsData, fetchViolationsForAddresses } from '@/utils/wprdc/api';
import { updateViolationsDatabase } from '@/utils/database/violationsDb';

/**
 * Fetch violations from WPRDC API for specific addresses and import them to the database
 * @param addresses List of addresses to fetch violations for
 * @returns Object containing count of imported violations
 */
export async function fetchWPRDCViolationsForAddresses(addresses: string[]): Promise<{ count: number }> {
  try {
    // Get violations from the API
    const violations = await fetchViolationsForAddresses(addresses);
    
    // Import the filtered violations to the database
    const importedCount = await updateViolationsDatabase(violations);
    
    return { count: importedCount };
  } catch (error) {
    console.error('Error in fetchWPRDCViolationsForAddresses:', error);
    throw error;
  }
}

/**
 * Synchronize the violations database with the latest data
 * This will be called on a scheduled basis
 */
export async function syncViolationsDatabase(): Promise<{ added: number }> {
  try {
    // Fetch the latest data
    const latestViolations = await fetchLatestViolationsData();
    
    // Update the database
    const added = await updateViolationsDatabase(latestViolations);
    
    return { added };
  } catch (error) {
    console.error('Error synchronizing violations database:', error);
    throw error;
  }
}

// Re-export functions from the imported modules for backward compatibility
export { fetchLatestViolationsData } from '@/utils/wprdc/api';
