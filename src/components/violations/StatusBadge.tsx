
import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

const StatusBadge = ({ status, size = 'default' }: StatusBadgeProps) => {
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
      case 'Open': return <AlertTriangle className={size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5"} />;
      case 'Closed': return <CheckCircle className={size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5"} />;
      case 'In Progress': return <Clock className={size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5"} />;
      default: return null;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1 font-normal", 
        getStatusColor(status),
        size === 'sm' ? "text-xs" : ""
      )}
    >
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

export default StatusBadge;
