
import React from 'react';
import { ViolationType } from '@/utils/types';
import { Info, MapPin, Hash, AlertCircle } from 'lucide-react';

interface ViolationDetailsProps {
  violation: ViolationType;
}

const ViolationDetails: React.FC<ViolationDetailsProps> = ({ violation }) => {
  return (
    <div className="space-y-3">
      {/* Always show case number first */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span>Case Number: {violation.casefile_number}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>Address: {violation.address}</span>
      </div>
      
      {violation.parcel_id && violation.parcel_id !== 'N/A' && (
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>Parcel ID: {violation.parcel_id}</span>
        </div>
      )}
      
      {violation.violation_description && (
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <div className="font-medium mb-1">Description:</div>
            <div className="whitespace-pre-line">{violation.violation_description}</div>
          </div>
        </div>
      )}
      
      {violation.investigation_outcome && (
        <div className="text-sm">
          <div className="font-medium mb-1">Outcome:</div>
          <div>{violation.investigation_outcome}</div>
        </div>
      )}
      
      {violation.investigation_findings && (
        <div className="text-sm">
          <div className="font-medium mb-1">Findings:</div>
          <div className="whitespace-pre-line">{violation.investigation_findings}</div>
        </div>
      )}
      
      {violation.status && (
        <div className="text-sm">
          <span className="font-medium">Status: </span>
          <span>{violation.original_status || violation.status}</span>
        </div>
      )}
      
      {violation.violation_code_section && violation.violation_code_section !== 'N/A' && (
        <div className="text-sm">
          <span className="font-medium">Code Section: </span>
          <span>{violation.violation_code_section}</span>
        </div>
      )}
    </div>
  );
};

export default ViolationDetails;
