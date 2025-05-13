
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bug, X, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';

interface SearchFormProps {
  onSearch: (address: string) => void;
  onAddAddress?: (address: string) => void;
  isLoading: boolean;
  onCancelSearch?: () => void;
  onSearchAll?: () => void;
  onFetchRecent?: () => void;
}

const SearchForm = ({ 
  onSearch, 
  onAddAddress, 
  isLoading, 
  onCancelSearch, 
  onSearchAll,
  onFetchRecent 
}: SearchFormProps) => {
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      // If no address is provided, search all violations
      console.log('No address provided, searching all violations in database');
      onSearch(''); // Pass empty string to trigger search all violations
    } else {
      console.log(`Submitting search for "${address}"`);
      onSearch(address);
    }
  };

  // Debug function for development only
  const handleDebugSearch = () => {
    console.log('Triggering debug search');
    onSearch('DEBUG');
  };

  const handleFetchRecent = () => {
    if (onFetchRecent) {
      console.log('Fetching recent violations');
      onFetchRecent();
    }
  };

  return (
    <AnimatedContainer className="w-full">
      <div className="nextdns-card p-6">
        <h2 className="text-lg font-medium mb-4">Search Property Violations</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <Input
                placeholder="Enter Pittsburgh address (e.g. 3208 DAWSON ST)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background/70 h-11 text-base"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              {isLoading ? (
                <>
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={onCancelSearch}
                    className="transition-all duration-300 h-11"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={true} 
                    className="transition-all duration-300 h-11"
                  >
                    <Spinner size="sm" className="mr-2" />
                    Searching...
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="submit" 
                    className="transition-all duration-300 h-11 px-6"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchRecent}
                    className="transition-all duration-300 h-11"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Recent
                  </Button>
                </>
              )}
              
              {/* Debug button - only visible in development */}
              {import.meta.env.DEV && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDebugSearch}
                  disabled={isLoading}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 h-11"
                >
                  <Bug className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Debug</span>
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a Pittsburgh address to search for specific property violations, or leave empty to view all violations in the database.
          </p>
        </form>
      </div>
    </AnimatedContainer>
  );
};

export default SearchForm;
