import React, { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import ViolationFinderHeader from '@/components/ViolationFinderHeader';
import BulkImportForm from '@/components/BulkImportForm';
import EmailSettingsDialog from '@/components/EmailSettingsDialog';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { useScheduledViolationCheck } from '@/hooks/useScheduledViolationCheck';
import { useToast } from '@/components/ui/use-toast';
import { initSupabaseTables } from '@/utils/supabase';

const ViolationFinder = () => {
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

  useEffect(() => {
    const addProvidedAddresses = async () => {
      const addressesToAdd = [
        "10 Edith Place",
        "12 Edith Place",
        "3210 Dawson St",
        "3220 Dawson St",
        "3227 Dawson St Units 1&2",
        "3228 Dawson St",
        "3230 Dawson St",
        "3232 Dawson St",
        "109 Oakland Ct",
        "25 Edith Pl",
        "3206 Dawson St Units 1-3",
        "3208 Dawson St Units 1&2",
        "3431 Parkview Ave",
        "3433 Parkview Ave Units 1&2",
        "5419 Potter St",
        "19 Edith Pl",
        "20 Edith Pl",
        "3341 Parkview Ave",
        "3343 Parkview Ave",
        "3707 Orpwood St",
        "3709 Orpwood St",
        "3711 Orpwood St Units 1&2",
        "3817 Bates St"
      ];
      
      if (addressesToAdd.length > 0) {
        try {
          await handleBulkImport(addressesToAdd);
          toast({
            title: "Addresses added",
            description: `Successfully added the provided addresses to your saved list.`,
          });
        } catch (error) {
          console.error("Failed to add addresses:", error);
          toast({
            title: "Error",
            description: "Failed to add the addresses to your saved list.",
            variant: "destructive"
          });
        }
      }
    };
    
    addProvidedAddresses();
  }, []);

  useEffect(() => {
    const initTables = async () => {
      try {
        await initSupabaseTables();
      } catch (error) {
        console.error('Failed to initialize Supabase tables:', error);
      }
    };
    
    initTables();
  }, []);

  const onSearchAll = () => {
    if (addresses.length > 10) {
      toast({
        title: "Processing in batches",
        description: `Searching ${addresses.length} addresses in smaller batches to avoid timeouts.`,
      });
    }
    handleSearchAll(addresses);
  };

  const processBulkImport = () => {
    const addressList = bulkImportText
      .split('\n')
      .map(address => address.trim())
      .filter(address => address.length > 0);
      
    if (addressList.length === 0) {
      toast({
        title: "No valid addresses",
        description: "No valid addresses found in the input.",
        variant: "destructive"
      });
      return;
    }
    
    handleBulkImport(addressList);
    setBulkImportText('');
    setShowBulkImport(false);
  };

  const saveEmailSettings = () => {
    updateEmailSettings(tempEmailEnabled, tempEmailAddress);
    setShowEmailSettings(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto">
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
          onSearch={handleSearch} 
          onAddAddress={handleAddAddress}
          isLoading={isLoading}
        />
        
        <AddressList 
          addresses={addresses} 
          onRemove={handleRemoveAddress}
          onSearch={handleSearch}
          onSearchAll={onSearchAll}
          selectedAddress={selectedAddress}
          onToggleBulkImport={() => setShowBulkImport(!showBulkImport)}
          showBulkImport={showBulkImport}
        />
        
        {showBulkImport && (
          <BulkImportForm
            bulkImportText={bulkImportText}
            onBulkImportTextChange={setBulkImportText}
            onCancel={() => setShowBulkImport(false)}
            onImport={processBulkImport}
          />
        )}
        
        <ResultsList 
          violations={violations}
          isLoading={isLoading}
        />
      </div>
      
      <EmailSettingsDialog
        open={showEmailSettings}
        onOpenChange={setShowEmailSettings}
        emailEnabled={tempEmailEnabled}
        emailAddress={tempEmailAddress}
        onEmailEnabledChange={setTempEmailEnabled}
        onEmailAddressChange={setTempEmailAddress}
        onSave={saveEmailSettings}
      />
    </div>
  );
};

export default ViolationFinder;
