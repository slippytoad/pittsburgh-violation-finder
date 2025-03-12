
import { ViolationType } from '@/utils/types';
import { filterNewViolations, sendViolationEmailReport } from '@/utils/violationTracking';
import { initEmailService } from '@/utils/emailService';
import { getPSTCheckTimeInLocalTime, getMillisecondsUntilNextCheck } from '@/utils/timeUtils';
import type { AppSettings } from '@/utils/types';
import { saveSettings } from './settingsService';

/**
 * Initialize the email service
 */
export const initializeEmailService = (): void => {
  initEmailService();
};

/**
 * Schedule the next violation check
 * @param settings Current app settings
 * @param checkCallback Function to call when it's time to check
 * @returns Cleanup function to clear the timeout
 */
export const scheduleNextCheck = (
  settings: Partial<AppSettings>,
  checkCallback: () => void
): (() => void) => {
  const nextCheck = getPSTCheckTimeInLocalTime();
  
  const msUntilNextCheck = getMillisecondsUntilNextCheck();
  console.log(`Next violation check scheduled for ${nextCheck.toLocaleString()} (in ${Math.round(msUntilNextCheck / 1000 / 60)} minutes)`);
  
  // Set the timeout for the next check
  const timeoutId = setTimeout(checkCallback, msUntilNextCheck);
  
  // Save the timeout ID to localStorage so it can be recovered on page reload
  localStorage.setItem('violationCheckTimeoutId', String(timeoutId));
  
  // Save the next check time to localStorage
  localStorage.setItem('nextViolationCheckTime', nextCheck.toISOString());
  
  // Update Supabase with the next check time
  const updatedSettings: Partial<AppSettings> = {
    violationChecksEnabled: settings.violationChecksEnabled,
    emailReportsEnabled: settings.emailReportsEnabled,
    emailReportAddress: settings.emailReportAddress,
    nextViolationCheckTime: nextCheck.toISOString()
  };
  
  saveSettings(updatedSettings);
  
  return () => clearTimeout(timeoutId);
};

/**
 * Process the results of a violation check
 * @param violations The violations found
 * @param emailEnabled Whether email reports are enabled
 * @param emailAddress Email address to send reports to
 * @param toast Toast function for notifications
 */
export const processViolationResults = async (
  violations: ViolationType[],
  emailEnabled: boolean,
  emailAddress: string,
  toast: (props: any) => any
): Promise<void> => {
  // Process the violations to find new ones
  const newViolations = filterNewViolations(violations);
  
  if (newViolations.length > 0) {
    toast({
      title: "New violations found!",
      description: `${newViolations.length} new violations were found during the scheduled check.`,
      variant: "default",
    });
  } else {
    console.log('No new violations found');
  }
  
  // Send email report
  const emailSent = await sendViolationEmailReport(newViolations, emailEnabled, emailAddress);
  
  if (emailSent) {
    toast({
      title: "Email Report Sent",
      description: `A report has been sent to ${emailAddress}`,
    });
  } else if (emailEnabled && emailAddress) {
    toast({
      title: "Email Report Failed",
      description: "Failed to send the email report. Please check your email configuration.",
      variant: "destructive",
    });
  }
};
