
import React from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import { InvestigationDetails } from '@/utils/types';

interface InvestigationInfoProps extends InvestigationDetails {
  size?: 'sm' | 'default';
}

const InvestigationInfo = ({ investigationOutcome, investigationFindings, size = 'default' }: InvestigationInfoProps) => {
  const iconSize = size === 'sm' ? "h-3 w-3 mt-0.5" : "h-4 w-4 mt-0.5";
  const textSize = size === 'sm' ? "text-xs" : "text-sm";
  const paddingSize = size === 'sm' ? "p-1.5" : "p-2";

  if (!investigationOutcome && !investigationFindings) return null;

  return (
    <div className="space-y-2 mb-2">
      {investigationOutcome && (
        <div className={`flex items-start gap-1 ${paddingSize} bg-green-50 dark:bg-green-900/10 rounded-md`}>
          <CheckCircle className={`${iconSize} text-green-500`} />
          <div>
            <span className={`font-medium ${textSize}`}>{size === 'sm' ? "Outcome:" : "Investigation Outcome:"}</span> 
            <p className={textSize}>{investigationOutcome}</p>
          </div>
        </div>
      )}
      {investigationFindings && (
        <div className={`flex items-start gap-1 ${paddingSize} bg-blue-50 dark:bg-blue-900/10 rounded-md`}>
          <FileText className={`${iconSize} text-blue-500`} />
          <div>
            <span className={`font-medium ${textSize}`}>{size === 'sm' ? "Findings:" : "Investigation Findings:"}</span> 
            <p className={`${textSize} whitespace-pre-line`}>{investigationFindings}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationInfo;
