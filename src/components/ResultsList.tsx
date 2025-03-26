
import React, { useState, useEffect } from 'react';
import { ViolationType } from '@/utils/types';
import ViolationCard from './violations/ViolationCard';
import AnimatedContainer from './AnimatedContainer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Filter, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ResultsListProps {
  violations: ViolationType[];
  isLoading: boolean;
}

const ResultsList = ({ violations, isLoading }: ResultsListProps) => {
  const [filteredViolations, setFilteredViolations] = useState<ViolationType[]>(violations);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Open' | 'Closed' | 'In Progress'>('All');

  // Update filtered violations when violations change or filter changes
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredViolations(violations);
    } else {
      setFilteredViolations(violations.filter(v => {
        // Ensure we're doing a strict string comparison
        return v.status === activeFilter;
      }));
    }
  }, [violations, activeFilter]);

  if (isLoading) {
    return (
      <AnimatedContainer className="w-full flex justify-center items-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Searching for cases...</p>
        </div>
      </AnimatedContainer>
    );
  }

  if (violations.length === 0) {
    return null;
  }

  // Count violations by status
  const openCount = violations.filter(v => v.status === 'Open').length;
  const closedCount = violations.filter(v => v.status === 'Closed').length;
  const inProgressCount = violations.filter(v => v.status === 'In Progress').length;

  return (
    <div className="w-full space-y-4 mt-4">
      <AnimatedContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-medium">{violations.length} Case{violations.length !== 1 ? 's' : ''} Found</h2>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeFilter === 'All' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('All')}
              className="h-8"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              All
              <Badge variant="secondary" className="ml-1 bg-muted">{violations.length}</Badge>
            </Button>
            
            <Button 
              variant={activeFilter === 'Open' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('Open')}
              className="h-8"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-500" />
              Open
              <Badge variant="secondary" className="ml-1 bg-muted">{openCount}</Badge>
            </Button>
            
            <Button 
              variant={activeFilter === 'Closed' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('Closed')}
              className="h-8"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
              Closed
              <Badge variant="secondary" className="ml-1 bg-muted">{closedCount}</Badge>
            </Button>
            
            <Button 
              variant={activeFilter === 'In Progress' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('In Progress')}
              className="h-8"
            >
              <Clock className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              In Progress
              <Badge variant="secondary" className="ml-1 bg-muted">{inProgressCount}</Badge>
            </Button>
          </div>
        </div>
      </AnimatedContainer>

      {filteredViolations.length === 0 ? (
        <AnimatedContainer>
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-border">
            <X className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No cases match the selected filter</p>
            <Button 
              variant="link" 
              onClick={() => setActiveFilter('All')}
              className="mt-2"
            >
              Clear filter
            </Button>
          </div>
        </AnimatedContainer>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredViolations.map((violation, index) => (
            <ViolationCard key={`${violation.id}-${index}`} violation={violation} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;
