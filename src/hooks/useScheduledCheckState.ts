import React, { useState, useEffect } from 'react';
import { loadSettingsFromLocalStorage } from '@/services/settingsService';
import { initializeEmailService } from '@/services/violationCheckService';
import { useSettingsInitialization } from '@/hooks/useSettingsInitialization';
import { useViolationCheck } from '@/hooks/useViolationCheck';
import { useScheduledControls } from '@/hooks/useScheduledControls';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';

export const useScheduledCheckState = () => {
  // Load initial states from localStorage
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
    }
  ] = useSettingsInitialization(initialSettings, () => checkForViolations());
  
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
  useEffect(() => {
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

  return {
    isScheduled,
    lastCheckTime,
    nextCheckTime: checkNextTime || nextCheckTime,
    emailEnabled,
    emailAddress,
    toggleScheduledChecks,
    checkForViolations,
    updateEmailSettings
  };
};
