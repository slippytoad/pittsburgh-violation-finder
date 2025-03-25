import { useState } from 'react';
import { ViolationType } from '@/utils/types';
import { searchViolations, searchAllViolations } from '@/utils/violationsService';
import { useSearchAbortController } from './useSearchAbortController';
import { useSearchErrorHandler } from './useSearchErrorHandler';

export function useSingleAddressSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { cancelSearch, getAbortController } = useSearchAbortController();
  const { handleSearchError, handleSearchSuccess } = useSearchErrorHandler();

  const handleSearch = async (address: string) => {
    // Get a new AbortController for this search
    const abortController = getAbortController();
    
    setIsLoading(true);
    setSelectedAddress(address ? address : 'all');
    
    try {
      let results: ViolationType[];
      
      if (!address.trim()) {
        // If address is empty, search all violations
        console.log('Searching all violations without address filter');
        results = await searchAllViolations(abortController.signal);
      } else {
        // Otherwise, search by address
        console.log(`Searching for violations at "${address}"`);
        results = await searchViolations(address, abortController.signal);
      }
      
      // If the search was aborted, don't process results
      if (abortController.signal.aborted) {
        return;
      }
      
      console.log(`Search completed, got ${results.length} results`);
      setViolations(results);
      setSearchCount(prev => prev + 1);
      
      handleSearchSuccess(results, address);
    } catch (error) {
      const errorResults = handleSearchError(error, 'Search');
      if (errorResults !== null) {
        setViolations(errorResults);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    selectedAddress,
    handleSearch,
    cancelSearch
  };
}
