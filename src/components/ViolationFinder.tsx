
import React from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';

const ViolationFinder = () => {
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll } = useViolations();
  const { addresses, handleAddAddress, handleRemoveAddress } = useAddresses();

  const onSearchAll = () => {
    handleSearchAll(addresses);
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
        />
        
        <ResultsList 
          violations={violations}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ViolationFinder;
