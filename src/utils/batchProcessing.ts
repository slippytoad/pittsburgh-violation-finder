
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

/**
 * Process all addresses at once without batches
 */
export const processBatch = async (
  addresses: string[], 
  startIndex: number, 
  setSearchCount: (callback: (prev: number) => number) => void,
  allResults: ViolationType[] = []
): Promise<ViolationType[]> => {
  console.log(`Processing all addresses at once`);
  
  try {
    // Search for all addresses in parallel without batching
    const searchPromises = addresses.map(address => {
      console.log(`Searching violations for address: ${address}`);
      return searchViolationsByAddress(address);
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
