import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Hash, Layers, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { ViolationType } from '@/utils/types';
import AnimatedContainer from '../AnimatedContainer';
import StatusBadge from './StatusBadge';
import InvestigationInfo from './InvestigationInfo';
import ViolationDetailsDialog from './ViolationDetailsDialog';
import RelatedViolationCard from './RelatedViolationCard';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';
import ViolationDetails from './ViolationDetails';

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

  const hasPreviousStates =
    violation.previousStatesCount &&
    violation.previousStatesCount > 0 &&
    violation.previousStates &&
    violation.previousStates.length > 0;

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
                {violation.previousStatesCount && violation.previousStatesCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>{violation.previousStatesCount} previous state{violation.previousStatesCount !== 1 ? 's' : ''}</span>
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
            
            {violation.investigationOutcome && (
              <div className="mt-2">
                <span className="text-sm font-medium">Investigation Outcome: </span>
                <span className="text-sm text-yellow-500">{violation.investigationOutcome}</span>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground space-y-1">
              {violation.fineAmount && (
                <p><span className="font-medium">Fine Amount:</span> ${violation.fineAmount.toFixed(2)}</p>
              )}
              {violation.dueDate && (
                <p><span className="font-medium">Due Date:</span> {formatDate(violation.dueDate)}</p>
              )}
            </div>
          </CardContent>
          
          {hasPreviousStates && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronRight
                className={cn("h-4 w-4 transition-transform", {
                  "rotate-90": expanded,
                })}
              />
              View {violation.previousStatesCount} previous state{violation.previousStatesCount !== 1 ? 's' : ''}
            </Button>
          )}
        </Card>
        
        {expanded && hasPreviousStates && (
          <div className="mt-4 space-y-4">
            {violation.previousStates?.map((previousState, stateIndex) => (
              <div
                key={previousState.id}
                className="rounded-lg border p-4 text-sm"
              >
                <div className="mb-2 font-medium">
                  State {stateIndex + 1}
                </div>
                <ViolationDetails violation={previousState} />
              </div>
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
