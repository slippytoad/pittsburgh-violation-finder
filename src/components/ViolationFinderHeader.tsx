
import React from 'react';
import AnimatedContainer from './AnimatedContainer';
import ScheduleControls from './ScheduleControls';

interface ViolationFinderHeaderProps {
  searchCount: number;
  isScheduled: boolean;
  emailEnabled: boolean;
  nextCheckTime: Date | null;
  emailAddress: string;
  onToggleSchedule: (enabled: boolean) => void;
  onOpenEmailSettings: () => void;
}

const ViolationFinderHeader = ({
  searchCount,
  isScheduled,
  emailEnabled,
  nextCheckTime,
  emailAddress,
  onToggleSchedule,
  onOpenEmailSettings
}: ViolationFinderHeaderProps) => {
  return (
    <AnimatedContainer className="mb-8 text-center nextdns-container py-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-3">Pittsburgh Property Violation Finder</h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Search for property violation notices in Pittsburgh, PA using the official WPRDC data.
        {searchCount > 0 && (
          <span className="block mt-2 text-sm font-medium text-primary">
            {searchCount} search{searchCount !== 1 ? 'es' : ''} completed
          </span>
        )}
      </p>
      
      <ScheduleControls
        isScheduled={isScheduled}
        emailEnabled={emailEnabled}
        nextCheckTime={nextCheckTime}
        emailAddress={emailAddress}
        onToggleSchedule={onToggleSchedule}
        onOpenEmailSettings={onOpenEmailSettings}
      />
    </AnimatedContainer>
  );
};

export default ViolationFinderHeader;
