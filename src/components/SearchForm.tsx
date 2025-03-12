
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';

interface SearchFormProps {
  onSearch: (parcelId: string) => void;
  onAddParcelId: (parcelId: string) => void;
  isLoading: boolean;
}

const SearchForm = ({ onSearch, onAddParcelId, isLoading }: SearchFormProps) => {
  const [parcelId, setParcelId] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parcelId.trim()) {
      toast({
        title: "Parcel ID required",
        description: "Please enter a parcel ID to search",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(parcelId);
  };

  const handleAddParcelId = () => {
    if (!parcelId.trim()) {
      toast({
        title: "Parcel ID required",
        description: "Please enter a parcel ID to add",
        variant: "destructive",
      });
      return;
    }
    
    onAddParcelId(parcelId);
    toast({
      title: "Parcel ID added",
      description: "Parcel ID has been saved to your list",
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
                placeholder="Enter Pittsburgh parcel ID (e.g. 0028F00195000000)..."
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
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
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddParcelId}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a Pittsburgh parcel ID to search for property violations (e.g. 0028F00195000000)
          </p>
        </form>
      </div>
    </AnimatedContainer>
  );
};

export default SearchForm;
