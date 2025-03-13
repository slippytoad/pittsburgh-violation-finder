
import React from 'react';
import { ViolationType } from '@/utils/types';
import { Calendar, Info } from 'lucide-react';

interface ViolationDetailsProps {
  violation: ViolationType;
}

const ViolationDetails: React.FC<ViolationDetailsProps> = ({ violation }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-2">
      {violation.dateIssued && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Date Issued: {formatDate(violation.dateIssued)}</span>
        </div>
      )}
      
      {violation.description && (
        <div className="flex items-start gap-2 text-sm">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span>{violation.description}</span>
        </div>
      )}
      
      {violation.investigationOutcome && (
        <div className="text-sm">
          <span className="font-medium">Outcome: </span>
          <span>{violation.investigationOutcome}</span>
        </div>
      )}
      
      {violation.investigationFindings && (
        <div className="text-sm">
          <span className="font-medium">Findings: </span>
          <span>{violation.investigationFindings}</span>
        </div>
      )}
      
      {violation.status && (
        <div className="text-sm">
          <span className="font-medium">Status: </span>
          <span>{violation.originalStatus || violation.status}</span>
        </div>
      )}
    </div>
  );
};

export default ViolationDetails;
