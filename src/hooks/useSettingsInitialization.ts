import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { 
  fetchSettings, 
  saveSettings,
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
  checkForViolations: () => Promise<(() => void) | undefined>
): [
  InitializedSettings,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<boolean>>,
  Dispatch<SetStateAction<string>>,
  Dispatch<SetStateAction<Date | null>>
] => {
  // Start with empty/false values and update after fetching from database
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to update all settings at once
  const updateAllSettings = async (settings: Partial<AppSettings>) => {
    const {
      violationChecksEnabled,
      emailReportsEnabled,
      emailReportAddress,
      nextViolationCheckTime
    } = settings;

    // Update state
    setIsScheduled(!!violationChecksEnabled);
    setEmailEnabled(!!emailReportsEnabled);
    if (emailReportAddress) setEmailAddress(emailReportAddress);
    
    // Update next check time if provided
    if (nextViolationCheckTime) {
      try {
        const nextCheck = new Date(nextViolationCheckTime);
        setNextCheckTime(nextCheck);
      } catch (e) {
        console.error('Invalid next check time format:', e);
      }
    }

    // If checks are enabled, set up the schedule
    if (violationChecksEnabled) {
      return scheduleNextCheck({
        violationChecksEnabled: true,
        emailReportsEnabled: !!emailReportsEnabled,
        emailReportAddress: emailReportAddress || ''
      }, checkForViolations);
    }
  };

  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      try {
        // Try to fetch settings from Supabase
        const settings = await fetchSettings();
        
        if (settings) {
          console.log('Loaded settings from database:', settings);
          
          // Update all settings from database
          const cleanup = await updateAllSettings({
            violationChecksEnabled: settings.violationChecksEnabled,
            emailReportsEnabled: settings.emailReportsEnabled,
            emailReportAddress: settings.emailReportAddress,
            nextViolationCheckTime: settings.nextViolationCheckTime
          });

          return cleanup;
        } else {
          console.log('No settings found in database');
          toast({
            title: "Settings Not Found",
            description: "Could not load settings from database. Using default values.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast({
          title: "Settings Error",
          description: "Failed to initialize settings. Some features may not work correctly.",
          variant: "destructive",
        });
      } finally {
        setIsInitialized(true);
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      const timeoutId = localStorage.getItem('violationCheckTimeoutId');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem('violationCheckTimeoutId');
      }
    };
  }, [isInitialized, checkForViolations, toast]);

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
