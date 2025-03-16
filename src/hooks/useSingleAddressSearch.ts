
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

export function useSingleAddressSearch(
  setViolations: (violations: ViolationType[]) => void,
  setSearchCount: (callback: (prev: number) => number) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setSelectedAddress(address);
    
    try {
      console.log(`Searching for violations at "${address}"`);
      const results = await searchViolationsByAddress(address);
      
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

  return {
    isLoading,
    selectedAddress,
    handleSearch
  };
}
