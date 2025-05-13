
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, FileUp, Check, AlertTriangle } from 'lucide-react';
import { importViolationsFromCsv, validateViolationsCsv } from '@/utils/csvImportService';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (count: number) => void;
  filterAddresses?: string[];
}

const CsvImportDialog = ({ open, onOpenChange, onImportSuccess, filterAddresses = [] }: CsvImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [onlyIncludeSavedAddresses, setOnlyIncludeSavedAddresses] = useState<boolean>(true);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      setUploadError('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleImport = async () => {
    if (!file) {
      setUploadError('Please select a file');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Validate the CSV file
      await validateViolationsCsv(file);
      
      // Import the CSV file
      const addressFilter = onlyIncludeSavedAddresses ? filterAddresses : undefined;
      const count = await importViolationsFromCsv(file, addressFilter);
      
      toast({
        title: "Import successful",
        description: `Imported ${count} violations.`,
        variant: "default",
      });
      
      // Clear the file input
      setFile(null);
      
      // Close the dialog
      onOpenChange(false);
      
      // Call the success callback
      if (onImportSuccess) {
        onImportSuccess(count);
      }
    } catch (error) {
      console.error('Import error:', error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Violations from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with violation data to import into the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            {file ? (
              <div className="flex flex-col items-center space-y-2">
                <Check className="h-8 w-8 text-green-500" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFile(null)}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <>
                <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mb-4">CSV files only</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>
          
          {filterAddresses && filterAddresses.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-addresses" 
                checked={onlyIncludeSavedAddresses}
                onCheckedChange={(checked) => setOnlyIncludeSavedAddresses(!!checked)}
              />
              <label
                htmlFor="filter-addresses"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Only import violations for saved addresses ({filterAddresses.length})
              </label>
            </div>
          )}
          
          {uploadError && (
            <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
              <p>{uploadError}</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-1">Required columns:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>address</li>
              <li>status</li>
            </ul>
            <p className="mt-2">Other recommended columns: casefile_number, violation_description, investigation_date, investigation_outcome, investigation_findings</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="ml-2"
          >
            {isUploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Importing...
              </>
            ) : (
              <>Import Violations</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
