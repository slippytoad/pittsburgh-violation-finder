
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import { ViolationType } from '@/utils/mockData';
import AnimatedContainer from '@/components/AnimatedContainer';
import { searchViolationsByParcelId } from '@/utils/api';

const Index = () => {
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parcelIds, setParcelIds] = useState<string[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved parcel IDs from localStorage on mount
  useEffect(() => {
    const savedParcelIds = localStorage.getItem('savedParcelIds');
    if (savedParcelIds) {
      try {
        setParcelIds(JSON.parse(savedParcelIds));
      } catch (error) {
        console.error('Failed to parse saved parcel IDs', error);
      }
    }
  }, []);

  // Save parcel IDs to localStorage when updated
  useEffect(() => {
    localStorage.setItem('savedParcelIds', JSON.stringify(parcelIds));
  }, [parcelIds]);

  const handleSearch = async (parcelId: string) => {
    setIsLoading(true);
    setSelectedParcelId(parcelId);
    
    try {
      // Use the updated API service to search by parcel ID
      const results = await searchViolationsByParcelId(parcelId);
      setViolations(results);
      
      if (results.length === 0) {
        toast({
          title: "No violations found",
          description: `No property violations found for this parcel ID`,
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

  const handleAddParcelId = (parcelId: string) => {
    if (!parcelIds.includes(parcelId)) {
      setParcelIds(prev => [...prev, parcelId]);
    } else {
      toast({
        title: "Parcel ID exists",
        description: "This parcel ID is already in your saved list",
      });
    }
  };

  const handleRemoveParcelId = (index: number) => {
    setParcelIds(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 px-6 py-8">
        <div className="max-w-screen-xl mx-auto">
          <AnimatedContainer className="mb-8 text-center">
            <h1 className="text-3xl font-semibold mb-2">Pittsburgh Property Violation Finder</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search for property violation notices in Pittsburgh, PA using parcel IDs with the official WPRDC data.
            </p>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 gap-8">
            <SearchForm 
              onSearch={handleSearch} 
              onAddParcelId={handleAddParcelId}
              isLoading={isLoading}
            />
            
            <AddressList 
              parcelIds={parcelIds} 
              onRemove={handleRemoveParcelId}
              onSearch={handleSearch}
              selectedParcelId={selectedParcelId}
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
