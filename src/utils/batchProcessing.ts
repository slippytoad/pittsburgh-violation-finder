
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

/**
 * Process all addresses at once without batches
 */
export const processBatch = async (
  addresses: string[], 
  startIndex: number, 
  setSearchCount: (callback: (prev: number) => number) => void,
  allResults: ViolationType[] = [],
  signal?: AbortSignal
): Promise<ViolationType[]> => {
  console.log(`Processing all addresses at once`);
  
  try {
    // Check if the operation has been aborted
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted', 'AbortError');
    }
    
    // Search for all addresses in parallel without batching
    const searchPromises = addresses.map(address => {
      console.log(`Searching violations for address: ${address}`);
      return searchViolationsByAddress(address, signal);
    });
    
    const results = await Promise.all(searchPromises);
    
    // Update search counter
    setSearchCount(prev => prev + addresses.length);
    
    // Combine all results
    return results.flat();
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
};
