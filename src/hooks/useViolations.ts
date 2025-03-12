
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { searchViolationsByAddress } from '@/utils/violationsService';

export function useViolations() {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setSelectedAddress(address);
    
    try {
      const results = await searchViolationsByAddress(address);
      setViolations(results);
      
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
      // Search for all addresses in parallel
      const searchPromises = addresses.map(address => searchViolationsByAddress(address));
      const resultsArrays = await Promise.all(searchPromises);
      
      // Flatten the results and remove duplicates by id
      const allViolations = resultsArrays.flat();
      const uniqueViolations: ViolationType[] = [];
      const seenIds = new Set();
      
      allViolations.forEach(violation => {
        if (!seenIds.has(violation.id)) {
          seenIds.add(violation.id);
          uniqueViolations.push(violation);
        }
      });
      
      // Sort the combined results
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
    handleSearch,
    handleSearchAll
  };
}
