
import { useState } from 'react';
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

  const handleSearchAll = async (addresses: string[]) => {
    console.log("handleSearchAll called");
    
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
      console.log("Starting batch processing");
      const allViolations = await processBatch(addresses, 0, setSearchCount);
      
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
    isLoading,
    handleSearchAll
  };
}
