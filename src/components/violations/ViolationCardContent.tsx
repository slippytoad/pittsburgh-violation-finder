
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
      <p className="text-sm mb-3 whitespace-pre-line">{violation.violation_description}</p>
      
      {/* Investigation Info */}
      <InvestigationInfo 
        investigationOutcome={violation.investigation_outcome} 
        investigationFindings={violation.investigation_findings} 
      />
    </CardContent>
  );
};

export default ViolationCardContent;
