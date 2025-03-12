
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import AnimatedContainer from './AnimatedContainer';

interface AddressListProps {
  addresses: string[];
  onRemove: (index: number) => void;
  onSearch: (address: string) => void;
  selectedAddress: string | null;
}

const AddressList = ({ addresses, onRemove, onSearch, selectedAddress }: AddressListProps) => {
  if (addresses.length === 0) {
    return null;
  }

  return (
    <AnimatedContainer className="w-full mt-6">
      <h2 className="text-lg font-medium mb-3">Saved Addresses</h2>
      <Card>
        <CardContent className="p-3">
          <ul className="divide-y">
            {addresses.map((address, index) => (
              <li 
                key={index} 
                className={`py-3 px-2 flex justify-between items-center rounded-md ${
                  selectedAddress === address ? 'bg-accent' : ''
                } hover:bg-accent/50 transition-colors`}
              >
                <span className="text-sm truncate mr-2">{address}</span>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => onSearch(address)}
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default AddressList;
