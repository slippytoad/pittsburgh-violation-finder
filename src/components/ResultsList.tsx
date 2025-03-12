
import React from 'react';
import { ViolationType } from '@/utils/mockData';
import ViolationCard from './ViolationCard';
import AnimatedContainer from './AnimatedContainer';

interface ResultsListProps {
  violations: ViolationType[];
  isLoading: boolean;
}

const ResultsList = ({ violations, isLoading }: ResultsListProps) => {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Searching for violations...</p>
        </div>
      </div>
    );
  }

  if (violations.length === 0) {
    return (
      <AnimatedContainer className="w-full text-center py-12">
        <p className="text-muted-foreground">No violations found for the provided address.</p>
      </AnimatedContainer>
    );
  }

  return (
    <div className="w-full space-y-4 mt-4">
      <AnimatedContainer>
        <h2 className="text-xl font-medium mb-4">{violations.length} Violation{violations.length !== 1 ? 's' : ''} Found</h2>
      </AnimatedContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {violations.map((violation, index) => (
          <ViolationCard key={violation.id} violation={violation} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
