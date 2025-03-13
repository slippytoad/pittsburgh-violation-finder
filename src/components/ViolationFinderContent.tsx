
import React, { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import ViolationFinderHeader from '@/components/ViolationFinderHeader';
import BulkImportSection from '@/components/BulkImportSection';
import EmailSettingsSection from '@/components/EmailSettingsSection';
import SampleAddressInitializer from '@/components/SampleAddressInitializer';
import DatabaseInitializer from '@/components/DatabaseInitializer';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { useScheduledViolationCheck } from '@/hooks/useScheduledViolationCheck';
import { useToast } from '@/components/ui/use-toast';

const ViolationFinderContent: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll, searchCount } = useViolations();
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

  useEffect(() => {
    setTempEmailEnabled(emailEnabled);
    setTempEmailAddress(emailAddress);
  }, [emailEnabled, emailAddress]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const onSearch = (address: string) => {
    handleSearch(address, selectedYear);
  };

  const onSearchAll = () => {
    if (addresses.length > 10) {
      toast({
        title: "Processing in batches",
        description: `Searching ${addresses.length} addresses in smaller batches to avoid timeouts.`,
      });
    }
    handleSearchAll(addresses, selectedYear);
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <DatabaseInitializer />
      <SampleAddressInitializer handleBulkImport={handleBulkImport} />
      
      <ViolationFinderHeader
        searchCount={searchCount}
        isScheduled={isScheduled}
        emailEnabled={emailEnabled}
        nextCheckTime={nextCheckTime}
        emailAddress={emailAddress}
        onToggleSchedule={toggleScheduledChecks}
        onOpenEmailSettings={() => setShowEmailSettings(true)}
      />
      
      <div id="violations-data" style={{ display: 'none' }}>
        {JSON.stringify(violations)}
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <SearchForm 
          onSearch={onSearch} 
          onAddAddress={handleAddAddress}
          isLoading={isLoading}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
        
        <ResultsList 
          violations={violations}
          isLoading={isLoading}
        />
        
        <AddressList 
          addresses={addresses} 
          onRemove={handleRemoveAddress}
          onSearch={(address) => handleSearch(address, selectedYear)}
          onSearchAll={onSearchAll}
          selectedAddress={selectedAddress}
          onToggleBulkImport={() => setShowBulkImport(!showBulkImport)}
          showBulkImport={showBulkImport}
          isLoading={isLoading}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
        
        <BulkImportSection 
          bulkImportText={bulkImportText}
          setBulkImportText={setBulkImportText}
          showBulkImport={showBulkImport}
          setShowBulkImport={setShowBulkImport}
          handleBulkImport={handleBulkImport}
        />
      </div>
      
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
