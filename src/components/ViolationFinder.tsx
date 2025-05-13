
import React, { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import { ViolationType } from '@/utils/types';
import AddressList from '@/components/AddressList';
import BulkImportSection from '@/components/BulkImportSection';
import ViolationFinderHeader from '@/components/ViolationFinderHeader';
import ViolationFinderContent from '@/components/ViolationFinderContent';
import { useAddresses } from '@/hooks/useAddresses';
import { useViolations } from '@/hooks/useViolations';
import { useSingleAddressSearch } from '@/hooks/useSingleAddressSearch';
import { useMultiAddressSearch } from '@/hooks/useMultiAddressSearch';
import { useRecentViolationsSearch } from '@/hooks/useRecentViolationsSearch';

const ViolationFinder = () => {
  const [bulkImportText, setBulkImportText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  const { 
    addresses, 
    handleAddAddress, 
    handleRemoveAddress, 
    handleBulkImport 
  } = useAddresses();
  
  const { 
    violations, 
    loading, 
    error, 
    selectedAddress, 
    setSelectedAddress, 
    setViolations, 
    clearViolations,
    searchType
  } = useViolations();
  
  // Individual hooks for different search types
  const { searchAddress, searchInProgress } = useSingleAddressSearch({
    setViolations,
    setSelectedAddress
  });
  
  const { searchAllAddresses, searchAllInProgress } = useMultiAddressSearch({
    addresses,
    setViolations,
    clearViolations
  });
  
  const { fetchRecentViolationsHandler, recentViolationsSearchInProgress } = useRecentViolationsSearch({
    setViolations,
    clearViolations
  });
  
  const handleSearch = async (address: string) => {
    clearViolations();
    await searchAddress(address);
    
    // Save the address if it's not already in the list
    if (!addresses.includes(address)) {
      handleAddAddress(address);
    }
  };
  
  const isLoading = searchInProgress || searchAllInProgress || recentViolationsSearchInProgress;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ViolationFinderHeader />
      
      <ViolationFinderContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <SearchForm 
              onSearch={handleSearch}
              onFetchRecent={fetchRecentViolationsHandler}
              isLoading={isLoading}
            />
            
            <AddressList 
              addresses={addresses}
              onRemove={handleRemoveAddress}
              onSearch={(address) => searchAddress(address)}
              onSearchAll={searchAllAddresses}
              selectedAddress={selectedAddress}
              onToggleBulkImport={() => setShowBulkImport(!showBulkImport)}
              showBulkImport={showBulkImport}
              isLoading={isLoading}
            />
            
            <BulkImportSection
              bulkImportText={bulkImportText}
              setBulkImportText={setBulkImportText}
              showBulkImport={showBulkImport}
              setShowBulkImport={setShowBulkImport}
              handleBulkImport={handleBulkImport}
              addresses={addresses}
            />
          </div>
          
          <div className="w-full md:w-2/3">
            <ResultsList 
              violations={violations}
              loading={loading}
              error={error}
              searchType={searchType}
            />
          </div>
        </div>
      </ViolationFinderContent>
    </div>
  );
};

export default ViolationFinder;
