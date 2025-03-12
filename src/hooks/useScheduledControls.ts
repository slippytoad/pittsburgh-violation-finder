
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from '@/services/settingsService';
import { saveSettingsToLocalStorage } from '@/services/settingsService';
import { scheduleNextCheck } from '@/services/violationCheckService';
import type { AppSettings } from '@/utils/types';

export const useScheduledControls = (
  isScheduled: boolean,
  setIsScheduled: React.Dispatch<React.SetStateAction<boolean>>,
  emailEnabled: boolean,
  setEmailEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  emailAddress: string,
  setEmailAddress: React.Dispatch<React.SetStateAction<string>>,
  nextCheckTime: Date | null,
  setNextCheckTime: React.Dispatch<React.SetStateAction<Date | null>>,
  checkForViolations: () => Promise<(() => void) | undefined>
) => {
  const { toast } = useToast();

  // Enable or disable scheduled checks
  const toggleScheduledChecks = async (enable: boolean) => {
    setIsScheduled(enable);
    
    saveSettingsToLocalStorage({
      violationChecksEnabled: enable
    });
    
    if (enable) {
      // Start the first check cycle
      const cleanup = scheduleNextCheck({
        violationChecksEnabled: true,
        emailReportsEnabled: emailEnabled,
        emailReportAddress: emailAddress
      }, checkForViolations);
      
      // Update next check time for UI
      const nextCheckTimeStr = localStorage.getItem('nextViolationCheckTime');
      if (nextCheckTimeStr) {
        setNextCheckTime(new Date(nextCheckTimeStr));
      }
      
      toast({
        title: "Daily checks enabled",
        description: `Violation checks will run daily at 6 AM PST. Next check: ${nextCheckTime?.toLocaleString() || 'calculating...'}`,
      });
      
      return cleanup;
    } else {
      // Disable scheduled checks
      const timeoutId = localStorage.getItem('violationCheckTimeoutId');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem('violationCheckTimeoutId');
      }
      
      toast({
        title: "Daily checks disabled",
        description: "Scheduled violation checks have been turned off.",
      });
    }
    
    // Save to Supabase
    const settings: Partial<AppSettings> = {
      violationChecksEnabled: enable,
      emailReportsEnabled: emailEnabled,
      emailReportAddress: emailAddress
    };
    
    await saveSettings(settings);
  };
  
  // Update email settings
  const updateEmailSettings = async (enabled: boolean, email: string = '') => {
    setEmailEnabled(enabled);
    if (email) setEmailAddress(email);
    
    saveSettingsToLocalStorage({
      emailReportsEnabled: enabled,
      emailReportAddress: email || emailAddress
    });
    
    // Save settings to Supabase
    const settings: Partial<AppSettings> = {
      violationChecksEnabled: isScheduled,
      emailReportsEnabled: enabled,
      emailReportAddress: email || emailAddress
    };
    
    await saveSettings(settings);
    
    toast({
      title: enabled ? "Email Reports Enabled" : "Email Reports Disabled",
      description: enabled ? `Reports will be sent to ${email || emailAddress}` : "Email reports have been turned off.",
    });
  };

  return {
    toggleScheduledChecks,
    updateEmailSettings
  };
};
