
import React from 'react';
import ViolationFinderContent from '@/components/ViolationFinderContent';
import { ScheduledCheckProvider } from '@/contexts/ScheduledCheckContext';

const ViolationFinder: React.FC = () => {
  return (
    <ScheduledCheckProvider>
      <ViolationFinderContent />
    </ScheduledCheckProvider>
  );
};

export default ViolationFinder;
