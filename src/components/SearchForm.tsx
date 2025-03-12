import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';
import { Spinner } from '@/components/ui/spinner';

interface SearchFormProps {
  onSearch: (address: string) => void;
  onAddAddress: (address: string) => void;
  isLoading: boolean;
}

const SearchForm = ({ onSearch, onAddAddress, isLoading }: SearchFormProps) => {
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter an address to search",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(address);
  };

  const handleAddAddress = () => {
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter an address to add",
        variant: "destructive",
      });
      return;
    }
    
    onAddAddress(address);
    toast({
      title: "Address added",
      description: "Address has been saved to your list",
    });
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
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="transition-all duration-300"
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAddress}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a Pittsburgh address to search for property violations (e.g. 3208 DAWSON ST)
          </p>
        </form>
      </div>
    </AnimatedContainer>
  );
};

export default SearchForm;
