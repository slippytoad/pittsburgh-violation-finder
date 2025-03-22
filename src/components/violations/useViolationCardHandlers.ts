
import { useState } from 'react';
import { ViolationType } from '@/utils/types';

export function useViolationCardHandlers(violation: ViolationType) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandRelatedInDialog, setExpandRelatedInDialog] = useState(false);
  
  const hasRelatedViolations = 
    violation.relatedViolationsCount && 
    violation.relatedViolationsCount > 0 && 
    violation.relatedViolations && 
    violation.relatedViolations.length > 0;

  const hasPreviousStates =
    violation.previousStatesCount &&
    violation.previousStatesCount > 0 &&
    violation.previousStates &&
    violation.previousStates.length > 0;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from being triggered
    setExpanded(!expanded);
  };

  const handleCardClick = () => {
    setExpandRelatedInDialog(false);
    setShowDetails(true);
  };

  const handleRelatedRecordsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandRelatedInDialog(true);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return {
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
  };
}
