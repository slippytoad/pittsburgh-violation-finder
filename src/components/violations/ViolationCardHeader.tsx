
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { MapPin, Calendar, Hash, Layers, History } from 'lucide-react';
import { ViolationType } from '@/utils/types';
import StatusBadge from './StatusBadge';

interface ViolationCardHeaderProps {
  violation: ViolationType;
  formatDate: (dateString: string) => string;
  hasRelatedViolations: boolean;
  hasPreviousStates: boolean;
  onRelatedRecordsClick: (e: React.MouseEvent) => void;
}

const ViolationCardHeader: React.FC<ViolationCardHeaderProps> = ({
  violation,
  formatDate,
  hasRelatedViolations,
  hasPreviousStates,
  onRelatedRecordsClick
}) => {
  return (
    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
      <div className="flex flex-col space-y-1.5">
        <h3 className="font-medium text-base">Case #: {violation.caseNumber}</h3>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{violation.address}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Investigation Date: {formatDate(violation.dateIssued)}</span>
          </div>
          {hasRelatedViolations && (
            <div 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={onRelatedRecordsClick}
            >
              <Layers className="h-4 w-4" />
              <span className="cursor-pointer underline">
                {violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {hasPreviousStates && (
            <div 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={onRelatedRecordsClick}
            >
              <History className="h-4 w-4" />
              <span className="cursor-pointer underline">
                {violation.previousStatesCount} related record{violation.previousStatesCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      <StatusBadge status={violation.status} />
    </CardHeader>
  );
};

export default ViolationCardHeader;
