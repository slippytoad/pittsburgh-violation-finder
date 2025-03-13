
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, Import, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import AnimatedContainer from './AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddressListProps {
  addresses: string[];
  onRemove: (index: number) => void;
  onSearch: (address: string) => void;
  onSearchAll: () => void;
  selectedAddress: string | null;
  onToggleBulkImport?: () => void;
  showBulkImport?: boolean;
  isLoading?: boolean;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const AddressList = ({ 
  addresses, 
  onRemove, 
  onSearch, 
  onSearchAll, 
  selectedAddress,
  onToggleBulkImport,
  showBulkImport,
  isLoading = false,
  selectedYear,
  onYearChange
}: AddressListProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  if (addresses.length === 0) {
    return null;
  }

  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Generate years from 2024 to current year for the dropdown
  const years = [];
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year);
  }

  return (
    <AnimatedContainer className="w-full mt-6">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                className="gap-1"
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search All ({selectedYear})
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {years.map(year => (
                <DropdownMenuItem 
                  key={year}
                  onClick={() => {
                    onYearChange(year);
                    onSearchAll();
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {!isCollapsed && (
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
