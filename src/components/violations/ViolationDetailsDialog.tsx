
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Hash, Info, ChevronRight, Layers, History } from 'lucide-react';
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
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [expandedRelated, setExpandedRelated] = useState(initialExpanded);
  
  // When the dialog opens, set the expanded state based on initialExpanded
  useEffect(() => {
    if (open) {
      setExpandedRelated(initialExpanded);
    }
  }, [open, initialExpanded]);
  
  const hasRelatedViolations = 
    violation.relatedViolationsCount && 
    violation.relatedViolationsCount > 0 && 
    violation.relatedViolations && 
    violation.relatedViolations.length > 0;

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
          <DialogTitle>Case #: {violation.caseNumber}</DialogTitle>
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
              
              {violation.fineAmount && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fine Amount:</strong> ${violation.fineAmount.toFixed(2)}</div>
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
          
          {/* Related Violations Section */}
          {hasRelatedViolations && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                className="text-sm mb-3 flex items-center gap-2"
                onClick={() => setExpandedRelated(!expandedRelated)}
              >
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform", {
                    "rotate-90": expandedRelated,
                  })}
                />
                <Layers className="h-4 w-4" />
                {expandedRelated ? "Hide" : "View"} {violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}
              </Button>
              
              {expandedRelated && (
                <div className="space-y-4 mt-2">
                  {violation.relatedViolations?.map((relatedViolation, idx) => (
                    <RelatedViolationCard
                      key={`${relatedViolation.id}-${idx}`}
                      violation={relatedViolation}
                      formatDate={formatDateLong}
                      variant="detailed"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Previous States Section */}
          {hasPreviousStates && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                className="text-sm mb-3 flex items-center gap-2"
                onClick={() => setExpandedHistory(!expandedHistory)}
              >
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform", {
                    "rotate-90": expandedHistory,
                  })}
                />
                <History className="h-4 w-4" />
                {expandedHistory ? "Hide" : "View"} {violation.previousStatesCount} historical record{violation.previousStatesCount !== 1 ? 's' : ''}
              </Button>
              
              {expandedHistory && (
                <div className="space-y-4 mt-2">
                  {violation.previousStates?.map((previousState, idx) => (
                    <div
                      key={`${previousState.id}-${idx}`}
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
