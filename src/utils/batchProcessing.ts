
import { ViolationType } from './types';
import { searchViolations } from './addressSearchService';

/**
 * Process a batch of addresses for violations
 * @param addresses - List of addresses to search
 * @param startIndex - Starting index in the addresses array
 * @param setSearchCount - Function to update the search count
 * @param existingViolations - Array of violations already found
 * @param signal - AbortSignal for cancelling the search
 * @returns Violations found for the batch
 */
export async function processBatch(
  addresses: string[],
  startIndex: number,
  setSearchCount: (count: (prev: number) => number) => void,
  existingViolations: ViolationType[] = [],
  signal?: AbortSignal
): Promise<ViolationType[]> {
  if (startIndex >= addresses.length) {
    return existingViolations;
  }

  let violations = [...existingViolations];
  let currentIndex = startIndex;

  try {
    // Process each address sequentially
    for (let i = startIndex; i < addresses.length; i++) {
      // Check if the operation has been cancelled
      if (signal?.aborted) {
        throw new DOMException('The operation was aborted', 'AbortError');
      }

      const address = addresses[i];
      currentIndex = i;

      console.log(`Processing address ${i + 1}/${addresses.length}: ${address}`);
      
      try {
        const addressViolations = await searchViolations(address, signal);
        
        // Add new violations to the results
        violations = [...violations, ...addressViolations];
        
        // Update search count for UI
        setSearchCount(prev => prev + 1);
      } catch (addressError) {
        // Only abort the entire process if it's an abort error
        if (addressError.name === 'AbortError') {
          throw addressError;
        }
        
        // For other errors, log and continue with the next address
        console.error(`Error processing address ${address}:`, addressError);
        setSearchCount(prev => prev + 1);
      }
    }

    return violations;
  } catch (error) {
    // If there's an abort error, just return what we have so far
    if (error.name === 'AbortError') {
      console.log(`Batch processing aborted at address ${currentIndex + 1}/${addresses.length}`);
      return violations;
    }

    // For other errors, log and return what we have so far
    console.error('Error processing batch:', error);
    return violations;
  }
}
