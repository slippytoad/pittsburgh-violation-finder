
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import { ViolationType } from '@/utils/mockData';
import AnimatedContainer from '@/components/AnimatedContainer';
import { 
  searchViolationsByAddress, 
  fetchSavedAddresses, 
  saveAddress, 
  removeAddress 
} from '@/utils/api';

const Index = () => {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved addresses from "database" on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const savedAddresses = await fetchSavedAddresses();
        setAddresses(savedAddresses);
      } catch (error) {
        console.error('Failed to load saved addresses', error);
        toast({
          title: "Failed to load addresses",
          description: "Could not load your saved addresses",
          variant: "destructive"
        });
      }
    };
    
    loadAddresses();
  }, [toast]);

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setSelectedAddress(address);
    
    try {
      // Use the updated API service to search by address
      const results = await searchViolationsByAddress(address);
      setViolations(results);
      
      if (results.length === 0) {
        toast({
          title: "No violations found",
          description: `No property violations found for this address`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching for violations",
        variant: "destructive",
      });
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAll = async () => {
    if (addresses.length === 0) {
      toast({
        title: "No saved addresses",
        description: "You don't have any saved addresses to search",
      });
      return;
    }

    setIsLoading(true);
    setSelectedAddress('all');
    
    try {
      // Search for all addresses in parallel
      const searchPromises = addresses.map(address => searchViolationsByAddress(address));
      const resultsArrays = await Promise.all(searchPromises);
      
      // Flatten the results and remove duplicates by id
      const allViolations = resultsArrays.flat();
      const uniqueViolations: ViolationType[] = [];
      const seenIds = new Set();
      
      allViolations.forEach(violation => {
        if (!seenIds.has(violation.id)) {
          seenIds.add(violation.id);
          uniqueViolations.push(violation);
        }
      });
      
      // Sort the combined results
      uniqueViolations.sort((a, b) => {
        const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
        const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
        return dateB - dateA;
      });
      
      setViolations(uniqueViolations);
      
      if (uniqueViolations.length === 0) {
        toast({
          title: "No violations found",
          description: "No property violations found for any of your saved addresses",
        });
      } else {
        toast({
          title: "Search complete",
          description: `Found ${uniqueViolations.length} violations across ${addresses.length} addresses`,
        });
      }
    } catch (error) {
      console.error('Search all error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching across all addresses",
        variant: "destructive",
      });
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (address: string) => {
    try {
      if (!addresses.includes(address)) {
        const updatedAddresses = await saveAddress(address);
        setAddresses(updatedAddresses);
        toast({
          title: "Address saved",
          description: "The address has been added to your saved list",
        });
      } else {
        toast({
          title: "Address exists",
          description: "This address is already in your saved list",
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving the address",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAddress = async (index: number) => {
    try {
      const updatedAddresses = await removeAddress(index);
      setAddresses(updatedAddresses);
      toast({
        title: "Address removed",
        description: "The address has been removed from your saved list",
      });
    } catch (error) {
      console.error('Error removing address:', error);
      toast({
        title: "Failed to remove",
        description: "There was an error removing the address",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 px-6 py-8">
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
              onSearchAll={handleSearchAll}
              selectedAddress={selectedAddress}
            />
            
            <ResultsList 
              violations={violations}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
