
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Mail, MailX } from 'lucide-react';

interface ScheduleControlsProps {
  isScheduled: boolean;
  emailEnabled: boolean;
  nextCheckTime: Date | null;
  emailAddress: string;
  onToggleSchedule: (enabled: boolean) => void;
  onOpenEmailSettings: () => void;
}

const ScheduleControls = ({
  isScheduled,
  emailEnabled,
  nextCheckTime,
  emailAddress,
  onToggleSchedule,
  onOpenEmailSettings
}: ScheduleControlsProps) => {
  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isScheduled ? "default" : "outline"}
          onClick={() => onToggleSchedule(!isScheduled)}
          className="flex items-center gap-2 text-sm"
        >
          {isScheduled ? (
            <>
              <BellOff className="h-4 w-4" />
              Disable Daily Checks
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              Enable Daily Checks at 6 AM PST
            </>
          )}
        </Button>
        
        <Button
          variant={emailEnabled ? "default" : "outline"}
          onClick={onOpenEmailSettings}
          className="flex items-center gap-2 text-sm"
        >
          {emailEnabled ? (
            <>
              <Mail className="h-4 w-4" />
              Email Reports: On
            </>
          ) : (
            <>
              <MailX className="h-4 w-4" />
              Email Reports: Off
            </>
          )}
        </Button>
      </div>
      
      {isScheduled && nextCheckTime && (
        <div className="mt-2 text-xs text-muted-foreground">
          Next check scheduled for: {nextCheckTime.toLocaleString()}
        </div>
      )}
      
      {emailEnabled && (
        <div className="mt-1 text-xs text-muted-foreground">
          Email reports will be sent to: {emailAddress}
        </div>
      )}
    </div>
  );
};

export default ScheduleControls;
