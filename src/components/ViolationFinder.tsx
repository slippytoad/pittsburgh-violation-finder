
import React, { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';

const ViolationFinder = () => {
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll } = useViolations();
  const { addresses, handleAddAddress, handleRemoveAddress, handleBulkImport } = useAddresses();
  const [bulkImportText, setBulkImportText] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);

  const onSearchAll = () => {
    handleSearchAll(addresses);
  };

  const processBulkImport = () => {
    const addressList = bulkImportText.split('\n');
    handleBulkImport(addressList);
    setBulkImportText('');
    setShowBulkImport(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <AnimatedContainer className="mb-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Pittsburgh Property Violation Finder</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search for property violation notices in Pittsburgh, PA using addresses with the official WPRDC data.
        </p>
      </AnimatedContainer>
      
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
          <AnimatedContainer>
            <div className="glass rounded-xl p-6 subtle-shadow">
              <h2 className="text-lg font-medium mb-4">Bulk Import Addresses</h2>
              <div className="space-y-4">
                <textarea 
                  className="w-full h-40 p-3 border rounded-md bg-background/70"
                  placeholder="Enter one address per line..."
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkImport(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={processBulkImport}
                  >
                    <Import className="mr-2 h-4 w-4" />
                    Import Addresses
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        )}
        
        <ResultsList 
          violations={violations}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ViolationFinder;
