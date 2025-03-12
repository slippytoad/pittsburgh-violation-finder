
import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduledCheckState } from '@/hooks/useScheduledCheckState';
import type { ScheduledCheckContextType } from './types';

const ScheduledCheckContext = createContext<ScheduledCheckContextType | undefined>(undefined);

export const ScheduledCheckProvider = ({ children }: { children: ReactNode }) => {
  const state = useScheduledCheckState();
  
  return (
    <ScheduledCheckContext.Provider value={state}>
      {children}
    </ScheduledCheckContext.Provider>
  );
};

export const useScheduledCheck = (): ScheduledCheckContextType => {
  const context = useContext(ScheduledCheckContext);
  if (context === undefined) {
    throw new Error('useScheduledCheck must be used within a ScheduledCheckProvider');
  }
  return context;
};
