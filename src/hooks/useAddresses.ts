
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchSavedAddresses, saveAddress, removeAddress } from '@/utils/addressService';

export function useAddresses() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const { toast } = useToast();

  // Load saved addresses from database on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const savedAddresses = await fetchSavedAddresses();
        setAddresses(savedAddresses);
      } catch (error) {
        console.error('Failed to load saved addresses', error);
        toast({
          title: "Failed to load addresses",
          description: "Could not load your saved addresses",
          variant: "destructive"
        });
      }
    };
    
    loadAddresses();
  }, [toast]);

  const handleAddAddress = async (address: string) => {
    try {
      if (!addresses.includes(address)) {
        const updatedAddresses = await saveAddress(address);
        setAddresses(updatedAddresses);
        toast({
          title: "Address saved",
          description: "The address has been added to your saved list",
        });
      } else {
        toast({
          title: "Address exists",
          description: "This address is already in your saved list",
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving the address",
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
    handleAddAddress,
    handleRemoveAddress
  };
}
