
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import { ViolationType } from '@/utils/mockData';
import AnimatedContainer from '@/components/AnimatedContainer';
import { searchViolationsByAddress } from '@/utils/api';

const Index = () => {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem('savedAddresses');
    if (savedAddresses) {
      try {
        setAddresses(JSON.parse(savedAddresses));
      } catch (error) {
        console.error('Failed to parse saved addresses', error);
      }
    }
  }, []);

  // Save addresses to localStorage when updated
  useEffect(() => {
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
  }, [addresses]);

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

  const handleAddAddress = (address: string) => {
    if (!addresses.includes(address)) {
      setAddresses(prev => [...prev, address]);
    } else {
      toast({
        title: "Address exists",
        description: "This address is already in your saved list",
      });
    }
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
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
