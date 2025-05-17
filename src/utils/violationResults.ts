
import { ViolationType } from '@/utils/types';

/**
 * Process and deduplicate violation results
 */
export const processViolationResults = (allViolations: ViolationType[]): ViolationType[] => {
  // Deduplicate violations
  const uniqueViolations: ViolationType[] = [];
  const seenIds = new Set<string>();
  
  allViolations.forEach(violation => {
    if (!seenIds.has(violation.id)) {
      seenIds.add(violation.id);
      uniqueViolations.push(violation);
    }
  });
  
  // Sort violations by date
  uniqueViolations.sort((a, b) => {
    const dateA = a.inspection_date ? new Date(a.inspection_date).getTime() : 0;
    const dateB = b.inspection_date ? new Date(b.inspection_date).getTime() : 0;
    return dateB - dateA;
  });
  
  return uniqueViolations;
};

/**
 * Update the hidden DOM element with violations data
 */
export const updateViolationsDataElement = (violations: ViolationType[]): void => {
  const violationsDataElement = document.getElementById('violations-data');
  if (violationsDataElement) {
    violationsDataElement.textContent = JSON.stringify(violations);
  }
};
