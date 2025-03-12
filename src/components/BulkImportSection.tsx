
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import BulkImportForm from '@/components/BulkImportForm';

interface BulkImportSectionProps {
  bulkImportText: string;
  setBulkImportText: (text: string) => void;
  showBulkImport: boolean;
  setShowBulkImport: (show: boolean) => void;
  handleBulkImport: (addressList: string[]) => Promise<void>;
}

const BulkImportSection: React.FC<BulkImportSectionProps> = ({
  bulkImportText,
  setBulkImportText,
  showBulkImport,
  setShowBulkImport,
  handleBulkImport
}) => {
  const { toast } = useToast();

  const processBulkImport = () => {
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
  };

  if (!showBulkImport) return null;

  return (
    <BulkImportForm
      bulkImportText={bulkImportText}
      onBulkImportTextChange={setBulkImportText}
      onCancel={() => setShowBulkImport(false)}
      onImport={processBulkImport}
    />
  );
};

export default BulkImportSection;
