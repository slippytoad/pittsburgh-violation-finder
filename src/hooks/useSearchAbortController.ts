
import { useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook to manage search abort functionality
 * Provides a reusable way to handle cancellation of API requests
 */
export function useSearchAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const cancelSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      toast({
        title: "Search cancelled",
        description: "The search operation has been cancelled",
      });
      
      return true;
    }
    return false;
  };

  const getAbortController = () => {
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  };

  return {
    cancelSearch,
    getAbortController,
    abortControllerRef
  };
}
