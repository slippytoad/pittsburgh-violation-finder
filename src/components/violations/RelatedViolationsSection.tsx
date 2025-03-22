
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ViolationType } from '@/utils/types';
import RelatedViolationCard from './RelatedViolationCard';

interface RelatedViolationsSectionProps {
  expanded: boolean;
  hasRelatedViolations: boolean;
  relatedViolationsCount: number | null | undefined;
  relatedViolations: ViolationType[] | undefined;
  formatDate: (dateString: string) => string;
  onToggle: (e: React.MouseEvent) => void;
}

const RelatedViolationsSection: React.FC<RelatedViolationsSectionProps> = ({
  expanded,
  hasRelatedViolations,
  relatedViolationsCount,
  relatedViolations,
  formatDate,
  onToggle
}) => {
  if (!hasRelatedViolations) return null;

  return (
    <>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full text-sm flex items-center justify-center gap-1"
          onClick={onToggle}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide related violations
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View {relatedViolationsCount} related violation{relatedViolationsCount !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardFooter>
      
      {expanded && (
        <div className="pl-6 border-l-2 border-dashed border-gray-300 ml-4 mt-2 space-y-3">
          {relatedViolations?.map((relatedViolation, relatedIndex) => (
            <RelatedViolationCard
              key={`${relatedViolation.id}-${relatedIndex}`}
              violation={relatedViolation}
              formatDate={formatDate}
              variant="compact"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default RelatedViolationsSection;
