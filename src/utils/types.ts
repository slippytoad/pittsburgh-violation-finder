/**
 * Shared type definitions
 */

// Status types
export type ViolationStatus = 'Open' | 'Closed' | 'In Progress';

// Investigation types
export interface InvestigationDetails {
  investigationOutcome?: string;
  investigationFindings?: string;
}

// Base violation types
export interface ViolationBase {
  id: string;
  address: string;
  violationType: string;
  dateIssued: string;
  status: ViolationStatus;
  description: string;
  propertyOwner: string;
}

// Payment information
export interface PaymentDetails {
  fineAmount: number | null;
  dueDate: string | null;
}

// Complete violation type with all properties
export interface ViolationType extends ViolationBase, PaymentDetails, InvestigationDetails {
  relatedViolationsCount?: number | null;
  relatedViolations?: ViolationType[];
  previousStatesCount?: number | null;
  previousStates?: ViolationType[];
}

export interface Address {
  id: number;
  address: string;
  created_at: string;
}

export interface AppSettings {
  id?: number;
  violationChecksEnabled: boolean;
  emailReportsEnabled: boolean;
  emailReportAddress: string;
  nextViolationCheckTime?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WPRDCResponse {
  success: boolean;
  result: {
    records: WPRDCViolation[];
    total: number;
  };
}

export interface WPRDCViolation {
  _id: number;
  violation_id: string;
  owner_name: string;
  inspection_date: string;
  investigation_date: string;
  parcel_id: string;
  inspection_result: string;
  agency_name: string;
  violation_description: string;
  casefile_number: string;
  address: string;
  status: string;
  violation_date: string;
  violation_code: string;
  violation_code_section: string;
  investigation_outcome?: string;
  investigation_findings?: string;
  [key: string]: any; // For any additional fields in the API response
}
