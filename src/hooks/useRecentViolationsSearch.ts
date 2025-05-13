
import { useState } from 'react';
import { ViolationType } from '@/utils/types';
import { fetchRecentViolations } from '@/utils/violationsService';
import { useSearchAbortController } from './useSearchAbortController';
import { useSearchErrorHandler } from './useSearchErrorHandler';
import { useToast } from '@/components/ui/use-toast';

export function useRecentViolationsSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const { cancelSearch, getAbortController } = useSearchAbortController();
  const { handleSearchError, handleSearchSuccess } = useSearchErrorHandler();
  const { toast } = useToast();

  const fetchRecentViolationsData = async () => {
    // Get a new AbortController for this search
    const abortController = getAbortController();
    
    setIsLoading(true);
    
    try {
      toast({
        title: "Fetching recent violations",
        description: "Looking for violations from the last 30 days...",
      });

      const results = await fetchRecentViolations(abortController.signal);
      
      // If the search was aborted, don't process results
      if (abortController.signal.aborted) {
        return;
      }
      
      console.log(`Recent violations search completed, got ${results.length} results`);
      setViolations(results);
      setSearchCount(prev => prev + 1);
      
      handleSearchSuccess(results, "Recent Violations (Last 30 Days)");
    } catch (error) {
      const errorResults = handleSearchError(error, 'Recent Violations Search');
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
    fetchRecentViolations: fetchRecentViolationsData,
    cancelSearch
  };
}
