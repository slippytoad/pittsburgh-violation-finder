
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

// Configuration for batching
const BATCH_SIZE = 5; // Number of addresses to process in each batch
const BATCH_DELAY_MS = 1000; // Delay between batches in milliseconds

/**
 * Process addresses in smaller batches with delays between batches
 * to avoid overwhelming the server with too many concurrent requests
 */
export const processBatch = async (
  addresses: string[], 
  startIndex: number, 
  setSearchCount: (callback: (prev: number) => number) => void,
  allResults: ViolationType[] = [],
  signal?: AbortSignal
): Promise<ViolationType[]> => {
  // If the operation has been aborted, stop processing
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }
  
  // Check if all addresses have been processed
  if (startIndex >= addresses.length) {
    return allResults;
  }
  
  // Calculate the end index for the current batch
  const endIndex = Math.min(startIndex + BATCH_SIZE, addresses.length);
  const currentBatch = addresses.slice(startIndex, endIndex);
  
  console.log(`Processing batch of ${currentBatch.length} addresses (${startIndex + 1}-${endIndex} of ${addresses.length})`);
  
  try {
    // Process the current batch of addresses
    const batchPromises = currentBatch.map(address => {
      console.log(`Searching violations for address: ${address}`);
      return searchViolationsByAddress(address, signal);
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Update search counter
    setSearchCount(prev => prev + currentBatch.length);
    
    // Combine batch results with previous results
    const updatedResults = [...allResults, ...batchResults.flat()];
    
    // If this is the last batch, return the results
    if (endIndex >= addresses.length) {
      return updatedResults;
    }
    
    // If operation was aborted during processing, stop here
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted', 'AbortError');
    }
    
    // Add a delay before processing the next batch
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    
    // Recursively process the next batch
    return processBatch(addresses, endIndex, setSearchCount, updatedResults, signal);
  } catch (error) {
    // If this is an abort error, propagate it
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('Batch processing error:', error);
    
    // For other errors, we can continue with the next batch
    // This allows partial results even if some addresses fail
    console.log(`Continuing to next batch after error...`);
    
    // Add a delay before processing the next batch
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    
    return processBatch(addresses, endIndex, setSearchCount, allResults, signal);
  }
};
