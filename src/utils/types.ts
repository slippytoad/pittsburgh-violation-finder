
/**
 * Shared type definitions
 */

// Status types
export type ViolationStatus = 'Open' | 'Closed' | 'In Progress';

// Investigation types
export interface InvestigationDetails {
  investigation_outcome?: string;
  investigation_findings?: string;
}

// Base violation types
export interface ViolationBase {
  id: string;
  casefile_number: string;
  address: string;
  status: ViolationStatus;
  original_status?: string;
  violation_description: string;
  parcel_id?: string;
  violation_code_section?: string;
}

// Complete violation type with all properties from API
export interface ViolationType extends ViolationBase, InvestigationDetails {
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
  lastDatabaseSyncTime?: string;
  nextDatabaseSyncTime?: string;
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
  _id: string | number;
  parcel_id: string;
  inspection_result: string;
  violation_description: string;
  casefile_number: string;
  address: string;
  status: string;
  investigation_date: string;
  violation_code: string;
  violation_code_section: string;
  investigation_outcome?: string;
  investigation_findings?: string;
  [key: string]: any; // For any additional fields in the API response
}
