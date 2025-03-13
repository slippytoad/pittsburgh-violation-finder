
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Hash, Info, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ViolationType } from '@/utils/types';
import StatusBadge from './StatusBadge';
import InvestigationInfo from './InvestigationInfo';
import RelatedViolationCard from './RelatedViolationCard';
import ViolationDetails from './ViolationDetails';
import { cn } from '@/lib/utils';

interface ViolationDetailsDialogProps {
  violation: ViolationType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatDate: (dateString: string) => string;
  initialExpanded?: boolean;
}

const ViolationDetailsDialog = ({ 
  violation, 
  open, 
  onOpenChange, 
  formatDate,
  initialExpanded = false
}: ViolationDetailsDialogProps) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  // When the dialog opens, set the expanded state based on initialExpanded
  useEffect(() => {
    if (open) {
      setExpanded(initialExpanded);
    }
  }, [open, initialExpanded]);
  
  const hasPreviousStates =
    violation.previousStatesCount &&
    violation.previousStatesCount > 0 &&
    violation.previousStates &&
    violation.previousStates.length > 0;

  // Override the formatDate function to ensure consistent formatting
  const formatDateLong = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Case #: {violation.id}</DialogTitle>
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
                    <span><strong>Investigation Date:</strong> {formatDateLong(violation.dateIssued)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Violation Section:</strong> {violation.violationType}</span>
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
                      <div><strong>Due Date:</strong> {formatDateLong(violation.dueDate)}</div>
                    )}
                  </div>
                </div>
              )}
              
              {(violation.investigationOutcome || violation.investigationFindings) && (
                <InvestigationInfo 
                  investigationOutcome={violation.investigationOutcome} 
                  investigationFindings={violation.investigationFindings} 
                />
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Violation Description</h3>
              <p className="text-sm whitespace-pre-line">{violation.description}</p>
            </div>
          </div>
          
          {hasPreviousStates && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                className="text-sm mb-3"
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform mr-1", {
                    "rotate-90": expanded,
                  })}
                />
                {expanded ? "Hide" : "View"} {violation.previousStatesCount} related record{violation.previousStatesCount !== 1 ? 's' : ''}
              </Button>
              
              {expanded && (
                <div className="space-y-4 mt-2">
                  {violation.previousStates?.map((previousState, idx) => (
                    <div
                      key={previousState.id}
                      className="rounded-lg border p-4 text-sm"
                    >
                      <div className="mb-2 font-medium">
                        Record {idx + 1}
                      </div>
                      <ViolationDetails violation={previousState} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViolationDetailsDialog;
