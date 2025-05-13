
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import BulkImportForm from '@/components/BulkImportForm';
import { fetchWPRDCViolationsForAddresses } from '@/utils/dataSync';

interface BulkImportSectionProps {
  bulkImportText: string;
  setBulkImportText: (text: string) => void;
  showBulkImport: boolean;
  setShowBulkImport: (show: boolean) => void;
  handleBulkImport: (addressList: string[]) => Promise<void>;
  addresses: string[];
}

const BulkImportSection: React.FC<BulkImportSectionProps> = ({
  bulkImportText,
  setBulkImportText,
  showBulkImport,
  setShowBulkImport,
  handleBulkImport,
  addresses
}) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const processBulkImport = async () => {
    if (bulkImportText.trim().length > 0) {
      // If text is provided, use the original import functionality
      const addressList = bulkImportText
        .split('\n')
        .map(address => address.trim())
        .filter(address => address.length > 0);
        
      if (addressList.length === 0) {
        toast({
          title: "No valid addresses",
          description: "No valid addresses found in the input.",
          variant: "destructive"
        });
        return;
      }
      
      handleBulkImport(addressList);
      setBulkImportText('');
      setShowBulkImport(false);
    } else {
      // If no text is provided, download from WPRDC API
      if (addresses.length === 0) {
        toast({
          title: "No addresses saved",
          description: "You need to have saved addresses to import violations from WPRDC.",
          variant: "destructive"
        });
        return;
      }

      setIsImporting(true);
      try {
        const result = await fetchWPRDCViolationsForAddresses(addresses);
        
        toast({
          title: "Import successful",
          description: `Imported ${result.count} violations from WPRDC for your saved addresses.`,
        });
        
        setShowBulkImport(false);
      } catch (error) {
        console.error('Error importing from WPRDC:', error);
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Failed to import violations from WPRDC.",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
      }
    }
  };

  if (!showBulkImport) return null;

  return (
    <BulkImportForm
      bulkImportText={bulkImportText}
      onBulkImportTextChange={setBulkImportText}
      onCancel={() => setShowBulkImport(false)}
      onImport={processBulkImport}
      isImporting={isImporting}
      mode="wprdc"
    />
  );
};

export default BulkImportSection;
