
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';

/**
 * Custom hook to handle search errors in a consistent way
 */
export function useSearchErrorHandler() {
  const { toast } = useToast();

  const handleSearchError = (error: any, action: string) => {
    // Only show error if it's not an abort error
    if (error.name !== 'AbortError') {
      console.error(`${action} error:`, error);
      toast({
        title: "Search failed",
        description: `An error occurred while ${action.toLowerCase()}`,
        variant: "destructive",
      });
      return [];
    }
    return null;
  };

  const handleSearchSuccess = (results: ViolationType[], address?: string) => {
    if (results.length === 0) {
      toast({
        title: "No violations found",
        description: address?.trim() 
          ? "No property violations found for this address" 
          : "No violations found in the database",
      });
    } else {
      toast({
        title: "Search complete",
        description: address?.trim()
          ? `Found ${results.length} violation${results.length !== 1 ? 's' : ''} for this address`
          : `Found ${results.length} violation${results.length !== 1 ? 's' : ''} in the database`,
      });
    }
    
    return results;
  };

  return {
    handleSearchError,
    handleSearchSuccess
  };
}
