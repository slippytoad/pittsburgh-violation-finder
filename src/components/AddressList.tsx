
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Search, Upload, ArrowDown } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';
import ViolationsDataTransfer from './ViolationsDataTransfer';

interface AddressListProps {
  addresses: string[];
  onRemove: (index: number) => void;
  onSearch: (address: string) => void;
  onSearchAll?: () => void;
  selectedAddress?: string;
  onToggleBulkImport: () => void;
  showBulkImport: boolean;
  isLoading?: boolean;
}

const AddressList = ({
  addresses,
  onRemove,
  onSearch,
  onSearchAll,
  selectedAddress,
  onToggleBulkImport,
  showBulkImport,
  isLoading
}: AddressListProps) => {
  return (
    <AnimatedContainer className="w-full">
      <div className="nextdns-card p-6">
        <h2 className="text-lg font-medium mb-4">Saved Addresses</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleBulkImport}
              >
                <Upload className="h-4 w-4 mr-1" />
                {showBulkImport ? 'Cancel Import' : 'Bulk Import'}
              </Button>
              
              {addresses.length > 0 && !isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSearchAll}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search All
                </Button>
              )}
            </div>
          </div>
          
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved addresses</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use the search form to add addresses
              </p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
              {addresses.map((address, index) => (
                <li 
                  key={index}
                  className={`
                    flex items-center justify-between p-2 rounded
                    ${selectedAddress === address ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                  `}
                >
                  <span 
                    className="truncate cursor-pointer flex-grow"
                    onClick={() => onSearch(address)}
                  >
                    {address}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className={`h-8 w-8 ${
                      selectedAddress === address ? 'hover:bg-primary/90' : 'hover:bg-accent/80'
                    }`}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
          
          {/* Add the data transfer component */}
          <ViolationsDataTransfer addresses={addresses} />
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default AddressList;
