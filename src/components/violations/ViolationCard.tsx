
import React from 'react';
import { Card } from '@/components/ui/card';
import { ViolationType } from '@/utils/types';
import AnimatedContainer from '../AnimatedContainer';
import ViolationDetailsDialog from './ViolationDetailsDialog';
import ViolationCardHeader from './ViolationCardHeader';
import ViolationCardContent from './ViolationCardContent';
import RelatedViolationsSection from './RelatedViolationsSection';
import { useViolationCardHandlers } from './useViolationCardHandlers';

interface ViolationCardProps {
  violation: ViolationType;
  index: number;
}

const ViolationCard = ({ violation, index }: ViolationCardProps) => {
  const {
    expanded,
    showDetails,
    expandRelatedInDialog,
    hasRelatedViolations,
    hasPreviousStates,
    formatDate,
    toggleExpanded,
    handleCardClick,
    handleRelatedRecordsClick,
    setShowDetails
  } = useViolationCardHandlers(violation);

  return (
    <>
      <AnimatedContainer 
        delay={index * 100} 
        className="w-full"
      >
        <Card 
          className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border hover:bg-accent/5 cursor-pointer"
          onClick={handleCardClick}
        >
          <ViolationCardHeader
            violation={violation}
            formatDate={formatDate}
            hasRelatedViolations={hasRelatedViolations}
            hasPreviousStates={hasPreviousStates}
            onRelatedRecordsClick={handleRelatedRecordsClick}
          />
          
          <ViolationCardContent
            violation={violation}
            formatDate={formatDate}
          />
          
          <RelatedViolationsSection
            expanded={expanded}
            hasRelatedViolations={hasRelatedViolations}
            relatedViolationsCount={violation.relatedViolationsCount}
            relatedViolations={violation.relatedViolations}
            formatDate={formatDate}
            onToggle={toggleExpanded}
          />
        </Card>
      </AnimatedContainer>

      <ViolationDetailsDialog 
        violation={violation}
        open={showDetails}
        onOpenChange={setShowDetails}
        formatDate={formatDate}
        initialExpanded={expandRelatedInDialog}
      />
    </>
  );
};

export default ViolationCard;
