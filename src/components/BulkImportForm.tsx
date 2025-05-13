
import React from 'react';
import { Button } from '@/components/ui/button';
import { Import, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedContainer from './AnimatedContainer';

interface BulkImportFormProps {
  bulkImportText: string;
  onBulkImportTextChange: (text: string) => void;
  onCancel: () => void;
  onImport: () => void;
  isImporting?: boolean;
  mode?: 'manual' | 'wprdc';
}

const BulkImportForm = ({
  bulkImportText,
  onBulkImportTextChange,
  onCancel,
  onImport,
  isImporting = false,
  mode = 'manual'
}: BulkImportFormProps) => {
  const { toast } = useToast();

  const handleImport = () => {
    if (mode === 'manual' && !bulkImportText.trim()) {
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
        <h2 className="text-lg font-medium mb-4">
          {mode === 'wprdc' 
            ? 'Import Violations from WPRDC API' 
            : 'Bulk Import Addresses'}
        </h2>
        <div className="space-y-4">
          {mode === 'manual' && (
            <textarea 
              className="w-full h-40 p-3 border rounded-md bg-background/70"
              placeholder="Enter one address per line..."
              value={bulkImportText}
              onChange={(e) => onBulkImportTextChange(e.target.value)}
            />
          )}
          
          {mode === 'wprdc' && (
            <div className="p-4 bg-background/70 border rounded-md">
              <p className="text-sm text-muted-foreground">
                This will fetch violation data from the Western Pennsylvania Regional Data Center (WPRDC) 
                for your saved addresses and import them into the violations database.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Only violations associated with your saved addresses will be imported.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Importing...
                </>
              ) : (
                <>
                  {mode === 'wprdc' ? (
                    <Database className="mr-2 h-4 w-4" />
                  ) : (
                    <Import className="mr-2 h-4 w-4" />
                  )}
                  {mode === 'wprdc' ? 'Import from WPRDC' : 'Import Addresses'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default BulkImportForm;
