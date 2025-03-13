
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from 'lucide-react';

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

  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Generate years from 2024 to current year for the dropdown
  const years = [];
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year.toString());
  }

  useEffect(() => {
    setTempEmailEnabled(emailEnabled);
    setTempEmailAddress(emailAddress);
  }, [emailEnabled, emailAddress]);

  const handleYearChange = (year: number) => {
    console.log("Year changed to:", year);
    setSelectedYear(year);
  };

  const onSearch = (address: string) => {
    handleSearch(address, selectedYear);
  };

  const onSearchAll = useCallback(() => {
    console.log("onSearchAll called with year:", selectedYear);
    if (addresses.length > 10) {
      toast({
        title: "Processing in batches",
        description: `Searching ${addresses.length} addresses in smaller batches to avoid timeouts.`,
      });
    }
    handleSearchAll(addresses, selectedYear);
  }, [addresses, handleSearchAll, selectedYear, toast]);

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <ViolationFinderHeader
          searchCount={searchCount}
          isScheduled={isScheduled}
          emailEnabled={emailEnabled}
          nextCheckTime={nextCheckTime}
          emailAddress={emailAddress}
          onToggleSchedule={toggleScheduledChecks}
          onOpenEmailSettings={() => setShowEmailSettings(true)}
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Year:</span>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => handleYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
