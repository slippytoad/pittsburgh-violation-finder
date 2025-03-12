
import React from 'react';
import { MapPin, Calendar, Hash, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ViolationType } from '@/utils/types';
import StatusBadge from './StatusBadge';
import InvestigationInfo from './InvestigationInfo';
import RelatedViolationCard from './RelatedViolationCard';

interface ViolationDetailsDialogProps {
  violation: ViolationType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatDate: (dateString: string) => string;
}

const ViolationDetailsDialog = ({ violation, open, onOpenChange, formatDate }: ViolationDetailsDialogProps) => {
  const hasRelatedViolations = 
    violation.relatedViolationsCount && 
    violation.relatedViolationsCount > 0 && 
    violation.relatedViolations && 
    violation.relatedViolations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{violation.violationType}</DialogTitle>
          <div className="mt-2">
            <StatusBadge status={violation.status} />
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Address:</strong> {violation.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Investigation Date:</strong> {formatDate(violation.dateIssued)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Case #:</strong> {violation.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Property Owner:</strong> {violation.propertyOwner}</span>
                  </div>
                </div>
              </div>
              
              {(violation.fineAmount || violation.dueDate) && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    {violation.fineAmount && (
                      <div><strong>Fine Amount:</strong> ${violation.fineAmount.toFixed(2)}</div>
                    )}
                    {violation.dueDate && (
                      <div><strong>Due Date:</strong> {formatDate(violation.dueDate)}</div>
                    )}
                  </div>
                </div>
              )}
              
              {(violation.investigationOutcome || violation.investigationFindings) && (
                <div className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <h3 className="text-sm font-medium mb-2">Investigation Results</h3>
                  <InvestigationInfo 
                    outcome={violation.investigationOutcome} 
                    findings={violation.investigationFindings} 
                  />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Violation Description</h3>
              <p className="text-sm whitespace-pre-line">{violation.description}</p>
            </div>
          </div>
          
          {hasRelatedViolations && (
            <div>
              <h3 className="text-base font-medium mb-3">Related Violations ({violation.relatedViolationsCount})</h3>
              <div className="space-y-4">
                {violation.relatedViolations?.map((relatedViolation, idx) => (
                  <RelatedViolationCard 
                    key={idx} 
                    violation={relatedViolation} 
                    formatDate={formatDate} 
                    variant="detailed"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViolationDetailsDialog;
