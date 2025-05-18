
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
  
  // Sort violations by id instead of inspection_date
  uniqueViolations.sort((a, b) => {
    // Sort by ID as a fallback since inspection_date is not available
    return b.id.localeCompare(a.id); // Sort newest first assuming higher IDs are newer
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
