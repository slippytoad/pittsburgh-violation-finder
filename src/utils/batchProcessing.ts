
import { toast } from "@/hooks/use-toast";
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

// Number of addresses to process in one batch
export const BATCH_SIZE = 5;
// Delay between batches in milliseconds
export const BATCH_DELAY = 1000;

/**
 * Process a batch of addresses with delay between batches
 */
export const processBatch = async (
  addresses: string[], 
  startIndex: number, 
  setSearchCount: (callback: (prev: number) => number) => void,
  year: number = new Date().getFullYear(),
  allResults: ViolationType[] = []
): Promise<ViolationType[]> => {
  if (startIndex >= addresses.length) {
    return allResults;
  }
  
  const endIndex = Math.min(startIndex + BATCH_SIZE, addresses.length);
  const batch = addresses.slice(startIndex, endIndex);
  
  try {
    // Search for all addresses in the current batch in parallel, using the year parameter
    const searchPromises = batch.map(address => searchViolationsByAddress(address, year));
    const batchResults = await Promise.all(searchPromises);
    
    // Update search counter
    setSearchCount(prev => prev + batch.length);
    
    // Combine results
    const combinedResults = [...allResults, ...batchResults.flat()];
    
    // If this is not the last batch, show progress
    if (endIndex < addresses.length) {
      const progress = Math.round((endIndex / addresses.length) * 100);
      toast({
        title: "Search in progress",
        description: `Processed ${endIndex} of ${addresses.length} addresses (${progress}%)`,
      });
      
      // Process the next batch after a delay
      return new Promise(resolve => {
        setTimeout(async () => {
          const nextResults = await processBatch(addresses, endIndex, setSearchCount, year, combinedResults);
          resolve(nextResults);
        }, BATCH_DELAY);
      });
    }
    
    return combinedResults;
  } catch (error) {
    console.error('Batch processing error:', error);
    // Continue with the next batch even if this one failed
    toast({
      title: "Partial batch failure",
      description: `Some addresses in the current batch failed. Continuing with remaining addresses.`,
      variant: "destructive",
    });
    
    // Process the next batch after a delay
    return new Promise(resolve => {
      setTimeout(async () => {
        const nextResults = await processBatch(addresses, endIndex, setSearchCount, year, allResults);
        resolve(nextResults);
      }, BATCH_DELAY);
    });
  }
};
