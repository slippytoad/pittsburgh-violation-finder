
import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import ViolationFinderHeader from '@/components/ViolationFinderHeader';
import BulkImportSection from '@/components/BulkImportSection';
import EmailSettingsSection from '@/components/EmailSettingsSection';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { useScheduledViolationCheck } from '@/hooks/useScheduledViolationCheck';
import { useToast } from '@/components/ui/use-toast';
import { initDatabaseSync } from '@/services/databaseSyncService';

interface ViolationFinderContentProps {
  children?: React.ReactNode;
}

const ViolationFinderContent: React.FC<ViolationFinderContentProps> = ({ children }) => {
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll, handleFetchRecent, cancelSearch, searchCount } = useViolations();
  const { addresses, handleAddAddress, handleRemoveAddress, handleBulkImport } = useAddresses();
  const { 
    isScheduled,
    nextCheckTime, 
    toggleScheduledChecks,
    emailEnabled,
    emailAddress,
    updateEmailSettings
  } = useScheduledViolationCheck();
  
  const [bulkImportText, setBulkImportText] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const [showEmailSettings, setShowEmailSettings] = useState<boolean>(false);
  const [tempEmailEnabled, setTempEmailEnabled] = useState<boolean>(emailEnabled);
  const [tempEmailAddress, setTempEmailAddress] = useState<string>(emailAddress);
  const { toast } = useToast();

  // Initialize database sync when the component mounts
  useEffect(() => {
    const cleanup = initDatabaseSync(result => {
      if (result.added > 0) {
        toast({
          title: "Database Updated",
          description: `${result.added} new cases found in the daily update.`,
          duration: 5000,
        });
      }
    });
    
    return cleanup;
  }, [toast]);

  useEffect(() => {
    setTempEmailEnabled(emailEnabled);
    setTempEmailAddress(emailAddress);
  }, [emailEnabled, emailAddress]);

  const onSearch = (address: string) => {
    handleSearch(address);
  };

  const onSearchAll = useCallback(() => {
    console.log("onSearchAll called from ViolationFinderContent");
    handleSearchAll(addresses);
  }, [addresses, handleSearchAll]);

  const onFetchRecent = useCallback(() => {
    console.log("onFetchRecent called from ViolationFinderContent");
    handleFetchRecent();
  }, [handleFetchRecent]);

  return (
    <div className="w-full py-4">
      <div className="mb-4">
        <ViolationFinderHeader
          searchCount={searchCount}
          isScheduled={isScheduled}
          emailEnabled={emailEnabled}
          nextCheckTime={nextCheckTime}
          emailAddress={emailAddress}
          onToggleSchedule={toggleScheduledChecks}
          onOpenEmailSettings={() => setShowEmailSettings(true)}
        />
      </div>
      
      <div id="violations-data" style={{ display: 'none' }}>
        {JSON.stringify(violations)}
      </div>
      
      {children ? (
        children
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-8">
            <SearchForm 
              onSearch={onSearch} 
              isLoading={isLoading}
              onCancelSearch={cancelSearch}
              onSearchAll={onSearchAll}
              onFetchRecent={onFetchRecent}
            />
            
            <AddressList 
              addresses={addresses} 
              onRemove={handleRemoveAddress}
              onSearch={onSearch}
              onSearchAll={onSearchAll}
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
          
          <div className="md:col-span-3">
            <ResultsList 
              violations={violations}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
      
      <EmailSettingsSection 
        showEmailSettings={showEmailSettings}
        setShowEmailSettings={setShowEmailSettings}
        tempEmailEnabled={tempEmailEnabled}
        setTempEmailEnabled={setTempEmailEnabled}
        tempEmailAddress={tempEmailAddress}
        setTempEmailAddress={setTempEmailAddress}
        updateEmailSettings={updateEmailSettings}
      />
    </div>
  );
};

export default ViolationFinderContent;
