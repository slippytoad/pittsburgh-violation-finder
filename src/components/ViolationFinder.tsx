
import React, { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import BulkImportSection from '@/components/BulkImportSection';
import ViolationFinderHeader from '@/components/ViolationFinderHeader';
import { useAddresses } from '@/hooks/useAddresses';
import { useViolations } from '@/hooks/useViolations';
import { useScheduledViolationCheck } from '@/hooks/useScheduledViolationCheck';

const ViolationFinder = () => {
  const [bulkImportText, setBulkImportText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  // Use the address hook for managing saved addresses
  const { 
    addresses, 
    isLoading: addressesLoading,
    handleAddAddress, 
    handleRemoveAddress, 
    handleBulkImport 
  } = useAddresses();
  
  // Use the violations hook for search functionality
  const { 
    violations, 
    isLoading: searchLoading, 
    selectedAddress, 
    searchCount,
    handleSearch, 
    handleSearchAll, 
    handleFetchRecent, 
    cancelSearch 
  } = useViolations();
  
  // Use the scheduled check hook for email settings and scheduled checks
  const {
    isScheduled,
    nextCheckTime, 
    emailEnabled,
    emailAddress,
    toggleScheduledChecks,
    updateEmailSettings
  } = useScheduledViolationCheck();

  // Determine if any loading is happening
  const isLoading = addressesLoading || searchLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ViolationFinderHeader 
        searchCount={searchCount}
        isScheduled={isScheduled}
        emailEnabled={emailEnabled}
        nextCheckTime={nextCheckTime}
        emailAddress={emailAddress}
        onToggleSchedule={toggleScheduledChecks}
        onOpenEmailSettings={() => {}}
      />
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <SearchForm 
            onSearch={handleSearch}
            onFetchRecent={handleFetchRecent}
            isLoading={searchLoading}
            onCancelSearch={cancelSearch}
            onSearchAll={() => handleSearchAll(addresses)}
          />
          
          <AddressList 
            addresses={addresses}
            onRemove={handleRemoveAddress}
            onSearch={handleSearch}
            onSearchAll={() => handleSearchAll(addresses)}
            selectedAddress={selectedAddress}
            onToggleBulkImport={() => setShowBulkImport(!showBulkImport)}
            showBulkImport={showBulkImport}
            isLoading={addressesLoading}
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
            isLoading={searchLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ViolationFinder;
