
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ViolationType } from '@/utils/mockData';
import AnimatedContainer from './AnimatedContainer';

interface ViolationCardProps {
  violation: ViolationType;
  index: number;
}

const ViolationCard = ({ violation, index }: ViolationCardProps) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Open': return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'Closed': return <CheckCircle className="h-3.5 w-3.5" />;
      case 'In Progress': return <Clock className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <AnimatedContainer 
      delay={index * 100} 
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-medium text-base">{violation.violationType}</h3>
            <p className="text-sm text-muted-foreground">{new Date(violation.dateIssued).toLocaleDateString()}</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn("flex items-center gap-1 font-normal", getStatusColor(violation.status))}
          >
            {getStatusIcon(violation.status)}
            {violation.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm mb-3">{violation.description}</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">Property Owner:</span> {violation.propertyOwner}</p>
            {violation.fineAmount && (
              <p><span className="font-medium">Fine Amount:</span> ${violation.fineAmount.toFixed(2)}</p>
            )}
            {violation.dueDate && (
              <p><span className="font-medium">Due Date:</span> {new Date(violation.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default ViolationCard;
