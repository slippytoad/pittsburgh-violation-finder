
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface InvestigationInfoProps {
  investigationOutcome?: string;
  investigationFindings?: string;
  size?: 'sm' | 'md';
}

const InvestigationInfo: React.FC<InvestigationInfoProps> = ({
  investigationOutcome,
  investigationFindings,
  size = 'md'
}) => {
  if (!investigationOutcome && !investigationFindings) return null;

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'p-2' : 'p-4';

  return (
    <Card className="mt-2">
      <CardContent className={`${padding} space-y-2`}>
        <h4 className="font-semibold">Investigation Details</h4>
        <Separator className="my-1" />
        
        {investigationOutcome && (
          <div>
            <span className={`font-medium ${textSize}`}>Outcome: </span>
            <span className={`${textSize}`}>{investigationOutcome}</span>
          </div>
        )}
        
        {investigationFindings && (
          <div>
            <span className={`font-medium ${textSize}`}>Findings: </span>
            <span className={`${textSize}`}>{investigationFindings}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestigationInfo;
