
/**
 * Utilities for transforming violation data
 */
import { ViolationType } from '@/utils/types';

/**
 * Transform Supabase data into our application's violation type
 * and group violations by casefile number
 */
export function transformViolationData(data: any[]): ViolationType[] {
  // First, transform all data to our application format
  const transformedData = data.map(item => ({
    id: item.id,
    casefile_number: item._id || item.casefile_number || 'N/A',
    address: item.address,
    parcel_id: item.parcel_id || 'N/A',
    status: item.status,
    inspection_date: item.inspection_date || item.investigation_date,
    violation_description: item.violation_description || '',
    violation_code_section: item.violation_code_section || 'N/A',
    owner_name: item.owner_name || item.property_owner || 'Unknown Owner',
    investigation_outcome: item.investigation_outcome || null,
    investigation_findings: item.investigation_findings || null,
    relatedViolations: [],
    relatedViolationsCount: 0
  }));

  // Group violations by casefile number/case id
  const groupedByCasefile: Record<string, ViolationType[]> = {};
  
  transformedData.forEach(violation => {
    const caseKey = violation.casefile_number;
    if (!groupedByCasefile[caseKey]) {
      groupedByCasefile[caseKey] = [];
    }
    groupedByCasefile[caseKey].push(violation);
  });

  // Create final result with proper related violations structure
  const result: ViolationType[] = [];
  
  Object.entries(groupedByCasefile).forEach(([caseNumber, violations]) => {
    if (violations.length === 1) {
      // No related violations
      result.push(violations[0]);
    } else {
      // Sort related violations by date, newest first
      violations.sort((a, b) => {
        const dateA = a.inspection_date ? new Date(a.inspection_date).getTime() : 0;
        const dateB = b.inspection_date ? new Date(b.inspection_date).getTime() : 0;
        return dateB - dateA;
      });
      
      // Use the most recent violation as the primary and add the rest as related
      const primaryViolation = { ...violations[0] };
      primaryViolation.relatedViolations = violations.slice(1);
      primaryViolation.relatedViolationsCount = violations.length - 1;
      
      result.push(primaryViolation);
    }
  });

  // Sort the final result by date, newest first
  return result.sort((a, b) => {
    const dateA = a.inspection_date ? new Date(a.inspection_date).getTime() : 0;
    const dateB = b.inspection_date ? new Date(b.inspection_date).getTime() : 0;
    return dateB - dateA;
  });
}
