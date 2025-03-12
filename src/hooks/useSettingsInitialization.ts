import { useState, useEffect } from 'react';
import { 
  fetchSettings, 
  saveSettingsToLocalStorage,
} from '@/services/settingsService';
import { scheduleNextCheck } from '@/services/violationCheckService';
import type { AppSettings } from '@/utils/types';

export interface InitializedSettings {
  isScheduled: boolean;
  emailEnabled: boolean;
  emailAddress: string;
  nextCheckTime: Date | null;
  isInitialized: boolean;
}

export const useSettingsInitialization = (
  initialSettings: Partial<AppSettings>,
  checkForViolations: () => Promise<(() => void) | undefined>
): [InitializedSettings, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [isScheduled, setIsScheduled] = useState<boolean>(!!initialSettings.violationChecksEnabled);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(!!initialSettings.emailReportsEnabled);
  const [emailAddress, setEmailAddress] = useState<string>(initialSettings.emailReportAddress || '');
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      // Try to fetch settings from Supabase
      const settings = await fetchSettings();
      
      if (settings) {
        // Use settings from Supabase
        setIsScheduled(settings.violationChecksEnabled);
        setEmailEnabled(settings.emailReportsEnabled);
        if (settings.emailReportAddress) setEmailAddress(settings.emailReportAddress);
        
        // Save to localStorage for better performance on future loads
        saveSettingsToLocalStorage({
          violationChecksEnabled: settings.violationChecksEnabled,
          emailReportsEnabled: settings.emailReportsEnabled,
          emailReportAddress: settings.emailReportAddress,
          nextViolationCheckTime: settings.nextViolationCheckTime
        });
        
        // If there's a saved next check time
        if (settings.nextViolationCheckTime) {
          try {
            const nextCheck = new Date(settings.nextViolationCheckTime);
            setNextCheckTime(nextCheck);
          } catch (e) {
            console.error('Invalid next check time format', e);
          }
        }
      }
      
      setIsInitialized(true);
      
      // If checks are enabled (either from Supabase or localStorage fallback)
      if (settings?.violationChecksEnabled || initialSettings.violationChecksEnabled) {
        // Try to recover the next check time from localStorage or Supabase
        const savedNextCheckTime = settings?.nextViolationCheckTime || 
                                  initialSettings.nextViolationCheckTime;
        
        if (savedNextCheckTime) {
          const nextCheck = new Date(savedNextCheckTime);
          setNextCheckTime(nextCheck);
          
          // If the saved next check time is in the past, run a check now
          if (nextCheck < new Date()) {
            return checkForViolations();
          } else {
            // Otherwise, schedule for the saved time
            const msUntilNextCheck = nextCheck.getTime() - new Date().getTime();
            const timeoutId = setTimeout(checkForViolations, msUntilNextCheck);
            localStorage.setItem('violationCheckTimeoutId', String(timeoutId));
            
            return () => clearTimeout(timeoutId);
          }
        } else {
          // No saved next check time, schedule a new one
          return scheduleNextCheck({
            violationChecksEnabled: true,
            emailReportsEnabled: emailEnabled,
            emailReportAddress: emailAddress
          }, checkForViolations);
        }
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      const timeoutId = localStorage.getItem('violationCheckTimeoutId');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
      }
    };
  }, [isInitialized, initialSettings, checkForViolations, emailAddress, emailEnabled]);

  return [
    { 
      isScheduled, 
      emailEnabled, 
      emailAddress, 
      nextCheckTime, 
      isInitialized 
    },
    setIsInitialized
  ];
};
