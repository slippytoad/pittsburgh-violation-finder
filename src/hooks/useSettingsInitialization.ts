import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { 
  fetchSettings, 
  saveSettingsToLocalStorage,
} from '@/services/settingsService';
import { scheduleNextCheck } from '@/services/violationCheckService';
import type { AppSettings } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';

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
): [
  InitializedSettings,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<string>>,
  Dispatch<SetStateAction<Date | null>>
] => {
  const [isScheduled, setIsScheduled] = useState<boolean>(!!initialSettings.violationChecksEnabled);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(!!initialSettings.emailReportsEnabled);
  const [emailAddress, setEmailAddress] = useState<string>(initialSettings.emailReportAddress || '');
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      try {
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
        } else {
          // If no settings found in Supabase, use localStorage values
          setIsScheduled(!!initialSettings.violationChecksEnabled);
          setEmailEnabled(!!initialSettings.emailReportsEnabled);
          setEmailAddress(initialSettings.emailReportAddress || '');
          
          if (initialSettings.nextViolationCheckTime) {
            try {
              const nextCheck = new Date(initialSettings.nextViolationCheckTime);
              setNextCheckTime(nextCheck);
            } catch (e) {
              console.error('Invalid next check time format from localStorage', e);
            }
          }
          
          toast({
            title: "Using Local Settings",
            description: "Could not fetch settings from database, using locally stored settings.",
            variant: "default",
          });
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
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast({
          title: "Settings Error",
          description: "Failed to initialize settings. Some features may not work correctly.",
          variant: "destructive",
        });
        setIsInitialized(true); // Set to true to prevent infinite retries
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
  }, [isInitialized, initialSettings, checkForViolations, emailAddress, emailEnabled, toast]);

  return [
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
  ];
};
