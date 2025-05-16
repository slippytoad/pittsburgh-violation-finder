
import React from 'react';
import { ViolationType } from '@/utils/types';
import { Calendar, Info, MapPin, Hash, User, AlertCircle } from 'lucide-react';

interface ViolationDetailsProps {
  violation: ViolationType;
}

const ViolationDetails: React.FC<ViolationDetailsProps> = ({ violation }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {/* Always show case number and investigation date first */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span>Case Number: {violation.caseNumber}</span>
      </div>
      
      {violation.dateIssued && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Investigation Date: {formatDate(violation.dateIssued)}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>Address: {violation.address}</span>
      </div>
      
      {violation.parcelId && violation.parcelId !== 'N/A' && (
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>Parcel ID: {violation.parcelId}</span>
        </div>
      )}
      
      {violation.propertyOwner && (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Owner: {violation.propertyOwner}</span>
        </div>
      )}
      
      {violation.description && (
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <div className="font-medium mb-1">Description:</div>
            <div className="whitespace-pre-line">{violation.description}</div>
          </div>
        </div>
      )}
      
      {violation.investigationOutcome && (
        <div className="text-sm">
          <div className="font-medium mb-1">Outcome:</div>
          <div>{violation.investigationOutcome}</div>
        </div>
      )}
      
      {violation.investigationFindings && (
        <div className="text-sm">
          <div className="font-medium mb-1">Findings:</div>
          <div className="whitespace-pre-line">{violation.investigationFindings}</div>
        </div>
      )}
      
      {violation.status && (
        <div className="text-sm">
          <span className="font-medium">Status: </span>
          <span>{violation.originalStatus || violation.status}</span>
        </div>
      )}
      
      {violation.violationType && (
        <div className="text-sm">
          <span className="font-medium">Violation Type: </span>
          <span>{violation.violationType}</span>
        </div>
      )}
      
      {violation.codeSection && violation.codeSection !== 'N/A' && (
        <div className="text-sm">
          <span className="font-medium">Code Section: </span>
          <span>{violation.codeSection}</span>
        </div>
      )}
    </div>
  );
};

export default ViolationDetails;
