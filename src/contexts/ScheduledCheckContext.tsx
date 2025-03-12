
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { loadSettingsFromLocalStorage } from '@/services/settingsService';
import { initializeEmailService } from '@/services/violationCheckService';
import { useSettingsInitialization } from '@/hooks/useSettingsInitialization';
import { useViolationCheck } from '@/hooks/useViolationCheck';
import { useScheduledControls } from '@/hooks/useScheduledControls';
import type { AppSettings } from '@/utils/types';

interface ScheduledCheckContextType {
  isScheduled: boolean;
  lastCheckTime: Date | null;
  nextCheckTime: Date | null;
  emailEnabled: boolean;
  emailAddress: string;
  toggleScheduledChecks: (enable: boolean) => Promise<(() => void) | undefined>;
  checkForViolations: () => Promise<(() => void) | undefined>;
  updateEmailSettings: (enabled: boolean, email?: string) => Promise<void>;
}

const ScheduledCheckContext = createContext<ScheduledCheckContextType | undefined>(undefined);

export const ScheduledCheckProvider = ({ children }: { children: ReactNode }) => {
  // Load initial states from localStorage with fallbacks
  const initialSettings = loadSettingsFromLocalStorage();
  
  const { handleSearchAll } = useViolations();
  const { addresses } = useAddresses();
  
  // Initialize the email service
  initializeEmailService();
  
  // Setup state via hooks
  const [
    { 
      isScheduled, 
      emailEnabled, 
      emailAddress, 
      nextCheckTime, 
      isInitialized 
    }, 
    setIsInitialized
  ] = useSettingsInitialization(initialSettings, () => checkForViolations());
  
  // Separate state settings for hooks that need them directly
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  // Create violation check hook
  const { 
    lastCheckTime: checkLastTime,
    nextCheckTime: checkNextTime,
    checkForViolations 
  } = useViolationCheck(
    handleSearchAll, 
    addresses, 
    isScheduled, 
    emailEnabled, 
    emailAddress
  );
  
  // Update last check time when it changes
  React.useEffect(() => {
    if (checkLastTime) {
      setLastCheckTime(checkLastTime);
    }
  }, [checkLastTime]);
  
  // Create controls hook
  const { 
    toggleScheduledChecks, 
    updateEmailSettings 
  } = useScheduledControls(
    isScheduled,
    useState(isScheduled)[1],
    emailEnabled,
    useState(emailEnabled)[1],
    emailAddress,
    useState(emailAddress)[1],
    nextCheckTime,
    useState(nextCheckTime)[1],
    checkForViolations
  );
  
  const value = {
    isScheduled,
    lastCheckTime,
    nextCheckTime: checkNextTime || nextCheckTime,
    emailEnabled,
    emailAddress,
    toggleScheduledChecks,
    checkForViolations,
    updateEmailSettings
  };
  
  return (
    <ScheduledCheckContext.Provider value={value}>
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
