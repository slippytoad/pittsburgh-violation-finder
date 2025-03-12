
import React from 'react';
import { MapPin, Calendar, Info } from 'lucide-react';
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
          <h4 className="font-medium text-sm">{violation.violationType}</h4>
          <StatusBadge status={violation.status} size="sm" />
        </div>
        <div className="flex flex-col space-y-1 mt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{violation.address}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Investigation Date: {formatDate(violation.dateIssued)}</span>
          </div>
          {variant === 'detailed' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Property Owner: {violation.propertyOwner}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-xs mb-2 whitespace-pre-line">{violation.description}</p>
        
        <InvestigationInfo 
          investigationOutcome={violation.investigationOutcome} 
          investigationFindings={violation.investigationFindings}
          size="sm"
        />
        
        {violation.fineAmount && (
          <div className="text-xs"><strong>Fine Amount:</strong> ${violation.fineAmount.toFixed(2)}</div>
        )}
        {violation.dueDate && (
          <div className="text-xs"><strong>Due Date:</strong> {formatDate(violation.dueDate)}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedViolationCard;
