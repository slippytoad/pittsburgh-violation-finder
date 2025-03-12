import { useState, useCallback } from 'react';
import { saveSettings } from '@/services/settingsService';
import { scheduleNextCheck } from '@/services/violationCheckService';
import { useToast } from '@/components/ui/use-toast';

export const useScheduledControls = (
  isScheduled: boolean,
  setIsScheduled: (value: boolean) => void,
  emailEnabled: boolean,
  setEmailEnabled: (value: boolean) => void,
  emailAddress: string,
  setEmailAddress: (value: string) => void,
  setNextCheckTime: (value: Date | null) => void,
  checkForViolations: () => Promise<(() => void) | undefined>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScheduleToggle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save new settings to database
      await saveSettings({
        violationChecksEnabled: !isScheduled,
        emailReportsEnabled: emailEnabled,
        emailReportAddress: emailAddress
      });

      // Update UI state
      setIsScheduled(!isScheduled);

      // Schedule next check if enabling
      if (!isScheduled) {
        const cleanup = await scheduleNextCheck({
          violationChecksEnabled: true,
          emailReportsEnabled: emailEnabled,
          emailReportAddress: emailAddress
        }, checkForViolations);

        if (cleanup) {
          return cleanup;
        }
      } else {
        // Clear next check time when disabling
        setNextCheckTime(null);
      }

      toast({
        title: !isScheduled ? "Daily Checks Enabled" : "Daily Checks Disabled",
        description: !isScheduled 
          ? "The application will now check for violations daily." 
          : "Daily violation checks have been disabled.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isScheduled, emailEnabled, emailAddress, setIsScheduled, setNextCheckTime, checkForViolations, toast]);

  const handleEmailToggle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save new settings to database
      await saveSettings({
        violationChecksEnabled: isScheduled,
        emailReportsEnabled: !emailEnabled,
        emailReportAddress: emailAddress
      });

      // Update UI state
      setEmailEnabled(!emailEnabled);

      toast({
        title: !emailEnabled ? "Email Reports Enabled" : "Email Reports Disabled",
        description: !emailEnabled 
          ? "You will now receive email reports for violations." 
          : "Email reports have been disabled.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling email:', error);
      toast({
        title: "Error",
        description: "Failed to update email settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isScheduled, emailEnabled, emailAddress, setEmailEnabled, toast]);

  const handleEmailAddressChange = useCallback(async (newAddress: string) => {
    setIsLoading(true);
    try {
      // Save new settings to database
      await saveSettings({
        violationChecksEnabled: isScheduled,
        emailReportsEnabled: emailEnabled,
        emailReportAddress: newAddress
      });

      // Update UI state
      setEmailAddress(newAddress);

      toast({
        title: "Email Address Updated",
        description: "Your email address has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating email address:', error);
      toast({
        title: "Error",
        description: "Failed to update email address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isScheduled, emailEnabled, setEmailAddress, toast]);

  return {
    isLoading,
    handleScheduleToggle,
    handleEmailToggle,
    handleEmailAddressChange
  };
};
