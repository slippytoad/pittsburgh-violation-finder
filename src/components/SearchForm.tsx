
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bug, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';

interface SearchFormProps {
  onSearch: (address: string) => void;
  onAddAddress?: (address: string) => void;
  isLoading: boolean;
  onCancelSearch?: () => void;
  onSearchAll?: () => void;
}

const SearchForm = ({ onSearch, onAddAddress, isLoading, onCancelSearch, onSearchAll }: SearchFormProps) => {
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      // If no address is provided, search all violations
      console.log('No address provided, searching all violations');
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

  return (
    <AnimatedContainer className="w-full">
      <div className="glass rounded-xl p-6 subtle-shadow">
        <h2 className="text-lg font-medium mb-4">Search Property Violations</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <Input
                placeholder="Enter Pittsburgh address (e.g. 3208 DAWSON ST)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background/70"
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
                    className="transition-all duration-300"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={true} 
                    className="transition-all duration-300"
                  >
                    <Spinner size="sm" className="mr-2" />
                    Searching...
                  </Button>
                </>
              ) : (
                <Button 
                  type="submit" 
                  className="transition-all duration-300"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              )}
              
              {/* Debug button - only visible in development */}
              {import.meta.env.DEV && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDebugSearch}
                  disabled={isLoading}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30"
                >
                  <Bug className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Debug</span>
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a Pittsburgh address to search for property violations, or leave empty to search all violations in the database.
          </p>
        </form>
      </div>
    </AnimatedContainer>
  );
};

export default SearchForm;
