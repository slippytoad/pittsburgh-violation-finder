
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Database, Download, Upload } from 'lucide-react';
import CsvImportDialog from './CsvImportDialog';
import { supabase } from '@/utils/supabase';
import { ViolationType } from '@/utils/types';

interface ViolationsDataTransferProps {
  addresses: string[];
}

const ViolationsDataTransfer: React.FC<ViolationsDataTransferProps> = ({ addresses }) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportViolations = async () => {
    if (addresses.length === 0) {
      toast({
        title: "No addresses found",
        description: "Please add addresses to your list before exporting violations.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Prepare the query to get violations for the listed addresses
      const { data: violations, error } = await supabase
        .from('violations')
        .select('*')
        .in('address', addresses);
      
      if (error) {
        throw error;
      }
      
      if (!violations || violations.length === 0) {
        toast({
          title: "No violations found",
          description: "No violation records found for your saved addresses.",
          variant: "destructive"
        });
        setIsExporting(false);
        return;
      }
      
      // Convert to CSV format
      const headers = Object.keys(violations[0]).join(',');
      const rows = violations.map(violation => 
        Object.values(violation).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `violations_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${violations.length} violation records.`,
      });
    } catch (error) {
      console.error('Failed to export violations:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSuccess = (count: number) => {
    toast({
      title: "Import successful",
      description: `Imported ${count} violation records.`,
    });
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-row gap-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleExportViolations}
          disabled={isExporting || addresses.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Violations'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowImportDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Violations
        </Button>
      </div>
      
      <CsvImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
        onImportSuccess={handleImportSuccess}
        filterAddresses={addresses}
      />
    </div>
  );
};

export default ViolationsDataTransfer;
