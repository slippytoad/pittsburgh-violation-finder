
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { processBatch } from '@/utils/batchProcessing';
import { processViolationResults, updateViolationsDataElement } from '@/utils/violationResults';

export function useMultiAddressSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSelectedAddress: (address: string | null) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast({
        title: "Search cancelled",
        description: "The search operation has been cancelled",
      });
    }
  };

  const handleSearchAll = async (addresses: string[]) => {
    console.log("handleSearchAll called");
    
    if (addresses.length === 0) {
      toast({
        title: "No saved addresses",
        description: "You don't have any saved addresses to search",
      });
      return;
    }

    // Create a new AbortController for this search
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setSelectedAddress('all');
    
    try {
      // Process all addresses at once without batching
      console.log("Starting search for all addresses");
      const allViolations = await processBatch(
        addresses, 
        0, 
        setSearchCount, 
        [], 
        abortControllerRef.current.signal
      );
      
      // If the search was aborted, don't process results
      if (abortControllerRef.current === null) {
        return;
      }
      
      // Process results (deduplicate and sort)
      const uniqueViolations = processViolationResults(allViolations as ViolationType[]);
      
      setViolations(uniqueViolations);
      
      // Update the hidden element for scheduled checks
      updateViolationsDataElement(uniqueViolations);
      
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
      // Only show error if it's not an abort error
      if (error.name !== 'AbortError') {
        console.error('Search all error:', error);
        toast({
          title: "Search failed",
          description: "An error occurred while searching across all addresses",
          variant: "destructive",
        });
        setViolations([]);
      }
    } finally {
      if (abortControllerRef.current !== null) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    handleSearchAll,
    cancelSearch
  };
}
