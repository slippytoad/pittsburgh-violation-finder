
import React, { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ViolationFinder = () => {
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll, searchCount } = useViolations();
  const { addresses, handleAddAddress, handleRemoveAddress, handleBulkImport } = useAddresses();
  const [bulkImportText, setBulkImportText] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const { toast } = useToast();

  // Add the provided addresses on component mount
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
      
      // Only add addresses if there are addresses to add
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
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!bulkImportText.trim()) {
      toast({
        title: "No addresses provided",
        description: "Please enter at least one address to import.",
        variant: "destructive"
      });
      return;
    }
    
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

  return (
    <div className="max-w-screen-xl mx-auto">
      <AnimatedContainer className="mb-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Pittsburgh Property Violation Finder</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search for property violation notices in Pittsburgh, PA using addresses with the official WPRDC data.
          {searchCount > 0 && <span className="block mt-1 text-sm">Completed {searchCount} searches so far</span>}
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
