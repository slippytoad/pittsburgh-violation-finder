
/**
 * Violations service for the Property Violations Finder app
 * This service handles searching for violations using Supabase
 */

import { ViolationType } from '@/utils/types';
import { searchViolations, searchAllViolations } from '@/utils/addressSearchService';
import { processBatch } from '@/utils/batchProcessing';

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

// Re-export functions from other services for backwards compatibility
export { searchViolations, searchAllViolations };
