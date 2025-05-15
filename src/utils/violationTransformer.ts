
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
    caseNumber: item.casefile_number || item.violation_id || 'N/A',
    address: item.address,
    parcelId: item.parcel_id || 'N/A',
    status: item.status,
    dateIssued: item.investigation_date || item.inspection_date,
    description: item.description || item.violation_description || '',
    codeSection: item.violation_code_section || 'N/A',
    instructions: item.instructions || 'N/A',
    outcome: item.investigation_outcome || 'N/A',
    findings: item.investigation_findings || '',
    violationType: item.violation_type || 'Unknown',
    propertyOwner: item.property_owner || item.owner_name || 'Unknown Owner',
    fineAmount: item.fine_amount || null,
    dueDate: item.due_date || null,
    investigationOutcome: item.investigation_outcome || null,
    investigationFindings: item.investigation_findings || null,
    relatedViolations: [],
    relatedViolationsCount: 0
  }));

  // Group violations by casefile number/case id
  const groupedByCasefile: Record<string, ViolationType[]> = {};
  
  transformedData.forEach(violation => {
    const caseKey = violation.caseNumber;
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
        const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
        const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
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
    const dateA = a.dateIssued ? new Date(a.dateIssued).getTime() : 0;
    const dateB = b.dateIssued ? new Date(b.dateIssued).getTime() : 0;
    return dateB - dateA;
  });
}
