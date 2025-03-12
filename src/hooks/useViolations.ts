
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

// Number of addresses to process in one batch
const BATCH_SIZE = 5;
// Delay between batches in milliseconds
const BATCH_DELAY = 1000;

export function useViolations() {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const { toast } = useToast();

  // Process a batch of addresses with delay between batches
  const processBatch = async (addresses: string[], startIndex: number, allResults: ViolationType[] = []) => {
    if (startIndex >= addresses.length) {
      return allResults;
    }
    
    const endIndex = Math.min(startIndex + BATCH_SIZE, addresses.length);
    const batch = addresses.slice(startIndex, endIndex);
    
    try {
      // Search for all addresses in the current batch in parallel
      const searchPromises = batch.map(address => searchViolationsByAddress(address));
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
            const nextResults = await processBatch(addresses, endIndex, combinedResults);
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
          const nextResults = await processBatch(addresses, endIndex, allResults);
          resolve(nextResults);
        }, BATCH_DELAY);
      });
    }
  };

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setSelectedAddress(address);
    
    try {
      const results = await searchViolationsByAddress(address);
      setViolations(results);
      setSearchCount(prev => prev + 1);
      
      if (results.length === 0) {
        toast({
          title: "No violations found",
          description: `No property violations found for this address`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching for violations",
        variant: "destructive",
      });
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAll = async (addresses: string[]) => {
    if (addresses.length === 0) {
      toast({
        title: "No saved addresses",
        description: "You don't have any saved addresses to search",
      });
      return;
    }

    setIsLoading(true);
    setSelectedAddress('all');
    
    try {
      // Process addresses in batches
      const allViolations = await processBatch(addresses, 0);
      
      // Deduplicate violations
      const uniqueViolations: ViolationType[] = [];
      const seenIds = new Set();
      
      allViolations.forEach(violation => {
        if (!seenIds.has(violation.id)) {
          seenIds.add(violation.id);
          uniqueViolations.push(violation);
        }
      });
      
      // Sort violations by date
      uniqueViolations.sort((a, b) => {
        const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
        const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
        return dateB - dateA;
      });
      
      setViolations(uniqueViolations);
      
      if (uniqueViolations.length === 0) {
        toast({
          title: "No violations found",
          description: "No property violations found for any of your saved addresses",
        });
      } else {
        toast({
          title: "Search complete",
          description: `Found ${uniqueViolations.length} violations across ${addresses.length} addresses`,
        });
      }
    } catch (error) {
      console.error('Search all error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching across all addresses",
        variant: "destructive",
      });
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    violations,
    isLoading,
    selectedAddress,
    searchCount,
    handleSearch,
    handleSearchAll
  };
}
