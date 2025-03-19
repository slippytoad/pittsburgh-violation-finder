
import { useState, useEffect } from 'react';
import { fetchAppSettings } from '@/services/settingsService';
import { initializeEmailService } from '@/services/violationCheckService';
import { useSettingsInitialization } from '@/hooks/useSettingsInitialization';
import { useViolationCheck } from '@/hooks/useViolationCheck';
import { useScheduledControls } from '@/hooks/useScheduledControls';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';

export const useScheduledCheckState = () => {
  // Use default initial settings since loadSettingsFromLocalStorage doesn't exist
  const initialSettings = {};
  
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
    setIsInitialized,
    setIsScheduled,
    setEmailEnabled,
    setEmailAddress,
    setNextCheckTime
  ] = useSettingsInitialization(() => checkForViolations());
  
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
  
  // Create controls hook with the correct parameter order
  const { 
    isLoading,
    handleScheduleToggle,
    handleEmailToggle,
    handleEmailAddressChange
  } = useScheduledControls(
    isScheduled,
    setIsScheduled,
    emailEnabled,
    setEmailEnabled,
    emailAddress,
    setEmailAddress,
    setNextCheckTime,
    checkForViolations
  );

  // Map the handlers to the expected interface functions
  const toggleScheduledChecks = handleScheduleToggle;
  
  // Create updateEmailSettings function that combines email toggle and address change
  const updateEmailSettings = async (enabled: boolean, email?: string) => {
    if (email && email !== emailAddress) {
      await handleEmailAddressChange(email);
    }
    
    if (enabled !== emailEnabled) {
      await handleEmailToggle();
    }
  };

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
