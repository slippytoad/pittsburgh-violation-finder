
import React from 'react';
import { Info, Hash } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ViolationType } from '@/utils/types';
import StatusBadge from './StatusBadge';
import InvestigationInfo from './InvestigationInfo';

interface RelatedViolationCardProps {
  violation: ViolationType;
  formatDate: (dateString: string) => string;
  variant?: 'compact' | 'detailed';
}

const RelatedViolationCard = ({ violation, formatDate, variant = 'compact' }: RelatedViolationCardProps) => {
  return (
    <Card className={variant === 'compact' ? "overflow-hidden border border-border" : "border border-border"}>
      <CardHeader className="p-3 pb-2">
        <div className="flex flex-row items-start justify-between">
          <h4 className="font-medium text-sm">
            {violation.casefile_number}
          </h4>
          <StatusBadge status={violation.status} size="sm" />
        </div>
        <div className="flex flex-col space-y-1 mt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>Case #: {violation.casefile_number}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-xs mb-2 whitespace-pre-line">{violation.violation_description}</p>
        
        <InvestigationInfo 
          investigationOutcome={violation.investigation_outcome} 
          investigationFindings={violation.investigation_findings}
          size="sm"
        />
        
        <div className="mt-2 text-xs">
          <strong>Status:</strong> <span>{violation.original_status || violation.status}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedViolationCard;
