
import { ViolationType } from './types';

export const mockViolations: ViolationType[] = [
  {
    id: "v1",
    casefile_number: "CASE-2025-001",
    address: "123 Forbes Ave, Pittsburgh, PA 15213",
    status: "Open",
    violation_description: "Exterior wall deterioration requiring repair",
    investigation_outcome: "Failed Inspection",
    investigation_findings: "Significant structural issues found",
    parcel_id: "0001",
    violation_code_section: "BC-123"
  },
  {
    id: "v2",
    casefile_number: "CASE-2025-002",
    address: "456 Murray Ave, Pittsburgh, PA 15217",
    status: "Closed",
    violation_description: "Improper garbage disposal",
    investigation_outcome: "Passed Re-inspection",
    investigation_findings: "Issues resolved",
    parcel_id: "0002",
    violation_code_section: "SC-456"
  },
  {
    id: "v3",
    casefile_number: "CASE-2025-003",
    address: "789 Butler St, Pittsburgh, PA 15201",
    status: "In Progress",
    violation_description: "Unauthorized business operation in residential zone",
    investigation_outcome: "Pending Review",
    investigation_findings: "Documentation requested from owner",
    parcel_id: "0003",
    violation_code_section: "ZC-789"
  },
  {
    id: "v4",
    casefile_number: "CASE-2025-001", // Same caseNumber to demonstrate grouping
    address: "123 Forbes Ave, Pittsburgh, PA 15213",
    status: "Open",
    violation_description: "Missing smoke detectors on premises",
    investigation_outcome: "Failed Inspection",
    investigation_findings: "Multiple code violations found",
    parcel_id: "0001",
    violation_code_section: "FS-101"
  },
  {
    id: "v5",
    casefile_number: "CASE-2025-004",
    address: "101 Wood St, Pittsburgh, PA 15222",
    status: "Open",
    violation_description: "Overgrown vegetation exceeding 10 inches",
    investigation_outcome: "Initial Inspection",
    investigation_findings: "Violation confirmed",
    parcel_id: "0004",
    violation_code_section: "PMC-101"
  }
];

export const getViolationsByAddress = (address: string): ViolationType[] => {
  if (!address) return [];
  
  // Simulate API call with delay
  return mockViolations.filter(violation => 
    violation.address.toLowerCase().includes(address.toLowerCase())
  );
};

// Add the missing getDebugViolations function
export const getDebugViolations = (): ViolationType[] => {
  return mockViolations;
};
