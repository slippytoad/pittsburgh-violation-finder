
import { useState } from 'react';
import { ViolationType } from '@/utils/types';
import { useSingleAddressSearch } from '@/hooks/useSingleAddressSearch';
import { useMultiAddressSearch } from '@/hooks/useMultiAddressSearch';
import { useRecentViolationsSearch } from '@/hooks/useRecentViolationsSearch';

export function useViolations() {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  
  // Use the single address search hook
  const { 
    isLoading: singleAddressLoading,
    selectedAddress,
    handleSearch,
    cancelSearch: cancelSingleSearch
  } = useSingleAddressSearch(setViolations, setSearchCount);
  
  // Use the multi-address search hook
  const {
    isLoading: multiAddressLoading,
    handleSearchAll,
    cancelSearch: cancelMultiSearch
  } = useMultiAddressSearch(setViolations, address => address ? address : null, setSearchCount);

  // Use the recent violations search hook
  const {
    isLoading: recentViolationsLoading,
    fetchRecentViolations: handleFetchRecent,
    cancelSearch: cancelRecentSearch
  } = useRecentViolationsSearch(setViolations, setSearchCount);
  
  // Determine overall loading state
  const isLoading = singleAddressLoading || multiAddressLoading || recentViolationsLoading;

  // Combined cancel function
  const cancelSearch = () => {
    cancelSingleSearch();
    cancelMultiSearch();
    cancelRecentSearch();
  };

  return {
    violations,
    isLoading,
    selectedAddress,
    searchCount,
    handleSearch,
    handleSearchAll,
    handleFetchRecent,
    cancelSearch
  };
}
