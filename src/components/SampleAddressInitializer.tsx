
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface SampleAddressInitializerProps {
  handleBulkImport: (addressList: string[]) => Promise<void>;
}

const SampleAddressInitializer: React.FC<SampleAddressInitializerProps> = ({ handleBulkImport }) => {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect once
    if (initialized) return;

    const addProvidedAddresses = async () => {
      const addressesToAdd = [
        "10 Edith Place",
        "12 Edith Place",
        "3210 Dawson St",
        "3220 Dawson St",
        "3227 Dawson St Units 1&2",
        "3228 Dawson St",
        "3230 Dawson St",
        "3232 Dawson St",
        "109 Oakland Ct",
        "25 Edith Pl",
        "3206 Dawson St Units 1-3",
        "3208 Dawson St Units 1&2",
        "3431 Parkview Ave",
        "3433 Parkview Ave Units 1&2",
        "5419 Potter St",
        "19 Edith Pl",
        "20 Edith Pl",
        "3341 Parkview Ave",
        "3343 Parkview Ave",
        "3707 Orpwood St",
        "3709 Orpwood St",
        "3711 Orpwood St Units 1&2",
        "3817 Bates St"
      ];
      
      if (addressesToAdd.length > 0) {
        try {
          await handleBulkImport(addressesToAdd);
          // Set initialized to true to prevent repeated execution
          setInitialized(true);
          toast({
            title: "Addresses added",
            description: `Successfully added the provided addresses to your saved list.`,
          });
        } catch (error) {
          console.error("Failed to add addresses:", error);
          // Still mark as initialized even on error to prevent spamming the user
          setInitialized(true);
          toast({
            title: "Error",
            description: "Failed to add the addresses to your saved list.",
            variant: "destructive"
          });
        }
      }
    };
    
    addProvidedAddresses();
  }, [handleBulkImport, toast, initialized]);

  return null;
};

export default SampleAddressInitializer;
