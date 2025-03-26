
import { useState } from 'react';
import { ViolationType } from '@/utils/types';
import { processBatch } from '@/utils/batchProcessing';
import { processViolationResults, updateViolationsDataElement } from '@/utils/violationResults';
import { useSearchAbortController } from './useSearchAbortController';
import { useSearchErrorHandler } from './useSearchErrorHandler';
import { useToast } from '@/components/ui/use-toast';

export function useMultiAddressSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSelectedAddress: (address: string | null) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const { cancelSearch, getAbortController } = useSearchAbortController();
  const { handleSearchError, handleSearchSuccess } = useSearchErrorHandler();
  const { toast } = useToast(); // Get the toast directly

  const handleSearchAll = async (addresses: string[]) => {
    console.log("handleSearchAll called");
    
    if (addresses.length === 0) {
      handleNoAddresses();
      return;
    }

    // Get a new AbortController for this search
    const abortController = getAbortController();
    
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
        abortController.signal
      );
      
      // If the search was aborted, don't process results
      if (abortController.signal.aborted) {
        return;
      }
      
      // Process results (deduplicate and sort)
      const uniqueViolations = processViolationResults(allViolations as ViolationType[]);
      
      setViolations(uniqueViolations);
      
      // Update the hidden element for scheduled checks
      updateViolationsDataElement(uniqueViolations);
      
      handleSearchSuccess(uniqueViolations);
    } catch (error) {
      const errorResults = handleSearchError(error, 'Searching all addresses');
      if (errorResults !== null) {
        setViolations(errorResults);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleNoAddresses = () => {
    toast({
      title: "No saved addresses",
      description: "You don't have any saved addresses to search",
    });
  };

  return {
    isLoading,
    handleSearchAll,
    cancelSearch
  };
}
