
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { ViolationType } from '@/utils/types';
import InvestigationInfo from './InvestigationInfo';

interface ViolationCardContentProps {
  violation: ViolationType;
  formatDate: (dateString: string) => string;
}

const ViolationCardContent: React.FC<ViolationCardContentProps> = ({
  violation,
  formatDate
}) => {
  return (
    <CardContent className="p-4 pt-2">
      <p className="text-sm mb-3 whitespace-pre-line">{violation.description}</p>
      
      {/* Investigation Info */}
      <InvestigationInfo 
        investigationOutcome={violation.investigationOutcome} 
        investigationFindings={violation.investigationFindings} 
      />
      
      <div className="text-xs text-muted-foreground space-y-1">
        {violation.fineAmount !== null && violation.fineAmount !== undefined && (
          <p><span className="font-medium">Fine Amount:</span> ${violation.fineAmount.toFixed(2)}</p>
        )}
        {violation.dueDate && (
          <p><span className="font-medium">Due Date:</span> {formatDate(violation.dueDate)}</p>
        )}
      </div>
    </CardContent>
  );
};

export default ViolationCardContent;
