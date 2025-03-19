
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { searchViolations } from '@/utils/api';

export function useSingleAddressSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
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

  const handleSearch = async (address: string) => {
    // Create a new AbortController for this search
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setSelectedAddress(address);
    
    try {
      console.log(`Searching for violations at "${address}"`);
      const results = await searchViolations(address, abortControllerRef.current.signal);
      
      // If the search was aborted, don't process results
      if (abortControllerRef.current === null) {
        return;
      }
      
      console.log(`Search completed, got ${results.length} results`);
      setViolations(results);
      setSearchCount(prev => prev + 1);
      
      if (results.length === 0) {
        toast({
          title: "No violations found",
          description: "No property violations found for this address",
        });
      } else {
        toast({
          title: "Search complete",
          description: `Found ${results.length} violation${results.length !== 1 ? 's' : ''} for this address`,
        });
      }
    } catch (error) {
      // Only show error if it's not an abort error
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "An error occurred while searching for violations",
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
    selectedAddress,
    handleSearch,
    cancelSearch
  };
}
