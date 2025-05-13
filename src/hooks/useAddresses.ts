
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchSavedAddresses, saveAddress, removeAddress, bulkImportAddresses } from '@/utils/addressService';

export function useAddresses() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load saved addresses from database on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        const savedAddresses = await fetchSavedAddresses();
        setAddresses(savedAddresses);
      } catch (error) {
        console.error('Failed to load saved addresses', error);
        toast({
          title: "Failed to load addresses",
          description: "Could not load your saved addresses from the database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAddresses();
  }, [toast]);

  const handleAddAddress = async (address: string) => {
    try {
      const updatedAddresses = await saveAddress(address);
      setAddresses(updatedAddresses);
      toast({
        title: "Address saved",
        description: "The address has been added to your saved list",
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving the address",
        variant: "destructive"
      });
    }
  };

  const handleBulkImport = async (addressList: string[]) => {
    try {
      // Filter out empty lines and trim each address
      const validAddresses = addressList
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
      
      if (validAddresses.length === 0) {
        toast({
          title: "No valid addresses",
          description: "Please provide at least one valid address",
          variant: "destructive"
        });
        return;
      }
      
      const originalCount = addresses.length;
      const updatedAddresses = await bulkImportAddresses(validAddresses);
      const newCount = updatedAddresses.length - originalCount;
      
      setAddresses(updatedAddresses);
      
      toast({
        title: "Addresses imported",
        description: `${newCount} new addresses have been added to your saved list`,
      });
    } catch (error) {
      console.error('Error importing addresses:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the addresses",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAddress = async (index: number) => {
    try {
      const updatedAddresses = await removeAddress(index);
      setAddresses(updatedAddresses);
      toast({
        title: "Address removed",
        description: "The address has been removed from your saved list",
      });
    } catch (error) {
      console.error('Error removing address:', error);
      toast({
        title: "Failed to remove",
        description: "There was an error removing the address",
        variant: "destructive"
      });
    }
  };

  return {
    addresses,
    isLoading,
    handleAddAddress,
    handleRemoveAddress,
    handleBulkImport
  };
}
