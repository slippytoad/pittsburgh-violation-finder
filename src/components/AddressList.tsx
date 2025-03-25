
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, Import, ChevronDown, ChevronUp, BookmarkIcon } from 'lucide-react';
import AnimatedContainer from './AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';

interface AddressListProps {
  addresses: string[];
  onRemove: (index: number) => void;
  onSearch: (address: string) => void;
  onSearchAll: () => void;
  selectedAddress: string | null;
  onToggleBulkImport?: () => void;
  showBulkImport?: boolean;
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
  isLoading = false
}: AddressListProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  if (addresses.length === 0) {
    return null;
  }

  // Add console log for debugging
  const handleSearchAllClick = () => {
    console.log("Search All button clicked, calling onSearchAll function");
    if (!isLoading) {
      onSearchAll();
    }
  };

  return (
    <AnimatedContainer className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Saved Addresses</h2>
          <Button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            size="sm" 
            variant="ghost" 
            className="p-0 h-8 w-8"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onToggleBulkImport}
            size="sm"
            variant={showBulkImport ? "secondary" : "outline"}
            className="gap-1"
          >
            <Import className="h-4 w-4" />
            Bulk Import
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            className="gap-1"
            onClick={handleSearchAllClick}
          >
            {isLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search All
          </Button>
        </div>
      </div>
      
      {!isCollapsed && (
        <Card className="nextdns-card overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {addresses.map((address, index) => (
                <li 
                  key={index} 
                  className={`py-3 px-4 flex justify-between items-center ${
                    selectedAddress === address ? 'bg-primary/5 dark:bg-primary/10' : ''
                  } hover:bg-accent/50 transition-colors`}
                >
                  <span className="text-sm truncate mr-2 font-medium">{address}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-primary"
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
      )}
      
      {isCollapsed && (
        <div className="text-sm text-muted-foreground">
          {addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved
        </div>
      )}
    </AnimatedContainer>
  );
};

export default AddressList;
