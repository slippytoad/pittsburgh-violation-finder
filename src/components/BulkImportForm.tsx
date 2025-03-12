
import React from 'react';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';

interface BulkImportFormProps {
  bulkImportText: string;
  onBulkImportTextChange: (text: string) => void;
  onCancel: () => void;
  onImport: () => void;
}

const BulkImportForm = ({
  bulkImportText,
  onBulkImportTextChange,
  onCancel,
  onImport
}: BulkImportFormProps) => {
  const { toast } = useToast();

  const handleImport = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "No addresses provided",
        description: "Please enter at least one address to import.",
        variant: "destructive"
      });
      return;
    }
    
    onImport();
  };

  return (
    <AnimatedContainer>
      <div className="glass rounded-xl p-6 subtle-shadow">
        <h2 className="text-lg font-medium mb-4">Bulk Import Addresses</h2>
        <div className="space-y-4">
          <textarea 
            className="w-full h-40 p-3 border rounded-md bg-background/70"
            placeholder="Enter one address per line..."
            value={bulkImportText}
            onChange={(e) => onBulkImportTextChange(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
            >
              <Import className="mr-2 h-4 w-4" />
              Import Addresses
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default BulkImportForm;
