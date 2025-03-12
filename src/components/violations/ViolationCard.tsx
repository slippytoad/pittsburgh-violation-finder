
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Hash, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { ViolationType } from '@/utils/types';
import AnimatedContainer from '../AnimatedContainer';
import StatusBadge from './StatusBadge';
import InvestigationInfo from './InvestigationInfo';
import ViolationDetailsDialog from './ViolationDetailsDialog';
import RelatedViolationCard from './RelatedViolationCard';

interface ViolationCardProps {
  violation: ViolationType;
  index: number;
}

const ViolationCard = ({ violation, index }: ViolationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const hasRelatedViolations = 
    violation.relatedViolationsCount && 
    violation.relatedViolationsCount > 0 && 
    violation.relatedViolations && 
    violation.relatedViolations.length > 0;

  return (
    <>
      <AnimatedContainer 
        delay={index * 100} 
        className="w-full"
      >
        <Card 
          className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border hover:bg-accent/5 cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex flex-col space-y-1.5">
              <h3 className="font-medium text-base">{violation.violationType}</h3>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{violation.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Investigation Date: {formatDate(violation.dateIssued)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Case #: {violation.id}</span>
                </div>
                {violation.relatedViolationsCount && violation.relatedViolationsCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <StatusBadge status={violation.status} />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm mb-3 whitespace-pre-line">{violation.description}</p>
            
            {/* Investigation Info */}
            <InvestigationInfo 
              investigationOutcome={violation.investigationOutcome} 
              investigationFindings={violation.investigationFindings} 
            />
            
            <div className="text-xs text-muted-foreground space-y-1">
              {violation.fineAmount && (
                <p><span className="font-medium">Fine Amount:</span> ${violation.fineAmount.toFixed(2)}</p>
              )}
              {violation.dueDate && (
                <p><span className="font-medium">Due Date:</span> {formatDate(violation.dueDate)}</p>
              )}
            </div>
          </CardContent>
          
          {hasRelatedViolations && (
            <CardFooter className="p-4 pt-0">
              <Button 
                variant="outline" 
                className="w-full text-sm flex items-center justify-center gap-1"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking this button
                  toggleExpanded();
                }}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide related violations
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View {violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {expanded && hasRelatedViolations && (
          <div className="pl-6 border-l-2 border-dashed border-gray-300 ml-4 mt-2 space-y-3">
            {violation.relatedViolations?.map((relatedViolation, relatedIndex) => (
              <RelatedViolationCard 
                key={relatedIndex} 
                violation={relatedViolation} 
                formatDate={formatDate} 
              />
            ))}
          </div>
        )}
      </AnimatedContainer>

      <ViolationDetailsDialog 
        violation={violation}
        open={showDetails}
        onOpenChange={setShowDetails}
        formatDate={formatDate}
      />
    </>
  );
};

export default ViolationCard;
