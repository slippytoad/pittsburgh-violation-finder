import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { useViolations } from './useViolations';
import { useAddresses } from './useAddresses';
import { 
  getPSTCheckTimeInLocalTime, 
  getMillisecondsUntilNextCheck 
} from '@/utils/timeUtils';
import { 
  filterNewViolations, 
  sendViolationEmailReport 
} from '@/utils/violationTracking';
import { initEmailService } from '@/utils/emailService';
import { supabase } from '@/utils/supabase';

// Define app settings type
type AppSettings = {
  violationChecksEnabled: boolean;
  emailReportsEnabled: boolean;
  emailReportAddress: string;
  nextViolationCheckTime?: string;
};

export function useScheduledViolationCheck() {
  // Load initial states from localStorage with fallbacks
  const initialIsScheduled = localStorage.getItem('violationChecksEnabled') === 'true';
  const initialEmailEnabled = localStorage.getItem('emailReportsEnabled') === 'true';
  const initialEmailAddress = localStorage.getItem('emailReportAddress') || '';

  const [isScheduled, setIsScheduled] = useState<boolean>(initialIsScheduled);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(initialEmailEnabled);
  const [emailAddress, setEmailAddress] = useState<string>(initialEmailAddress);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { handleSearchAll } = useViolations();
  const { addresses } = useAddresses();
  const { toast } = useToast();
  
  // Fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching settings:', error);
        return null;
      }
      
      return data as AppSettings;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return null;
    }
  };
  
  // Save settings to Supabase
  const saveSettings = async (settings: AppSettings) => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(settings, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving settings:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };
  
  // Perform the violation check
  const checkForViolations = async () => {
    if (addresses.length === 0) {
      console.log('No addresses to check for violations');
      return;
    }
    
    console.log('Checking for new violations', new Date().toLocaleString());
    setLastCheckTime(new Date());
    
    try {
      // Create a custom event handler to capture the results of the search
      const originalViolationsState: ViolationType[] = [];
      
      // Patch the handleSearchAll function to capture its results
      // This is a workaround since we can't directly get the results from handleSearchAll
      const patchedHandleSearchAll = async () => {
        // Listen for state updates on the violations
        const checkInterval = setInterval(() => {
          // Get the violations from the DOM or localStorage if available
          const violationsElement = document.getElementById('violations-data');
          if (violationsElement && violationsElement.textContent) {
            try {
              const violations = JSON.parse(violationsElement.textContent);
              clearInterval(checkInterval);
              
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
              sendViolationEmailReport(newViolations, emailEnabled, emailAddress)
                .then(success => {
                  if (success) {
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
                });
              
            } catch (e) {
              console.error('Error parsing violations data', e);
            }
          }
        }, 1000);
        
        // Set a timeout to clear the interval if it takes too long
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 30000); // 30 seconds timeout
        
        // Call the original search function
        await handleSearchAll(addresses);
      };
      
      await patchedHandleSearchAll();
      
    } catch (error) {
      console.error('Error during scheduled violation check:', error);
    }
    
    // Schedule the next check
    scheduleNextCheck();
  };
  
  // Schedule the next check
  const scheduleNextCheck = () => {
    const nextCheck = getPSTCheckTimeInLocalTime();
    setNextCheckTime(nextCheck);
    
    const msUntilNextCheck = getMillisecondsUntilNextCheck();
    console.log(`Next violation check scheduled for ${nextCheck.toLocaleString()} (in ${Math.round(msUntilNextCheck / 1000 / 60)} minutes)`);
    
    // Set the timeout for the next check
    const timeoutId = setTimeout(checkForViolations, msUntilNextCheck);
    
    // Save the timeout ID to localStorage so it can be recovered on page reload
    localStorage.setItem('violationCheckTimeoutId', String(timeoutId));
    
    // Save the next check time to both localStorage and Supabase
    localStorage.setItem('nextViolationCheckTime', nextCheck.toISOString());
    
    // Update Supabase with the next check time
    const settings: AppSettings = {
      violationChecksEnabled: isScheduled,
      emailReportsEnabled: emailEnabled,
      emailReportAddress: emailAddress,
      nextViolationCheckTime: nextCheck.toISOString()
    };
    saveSettings(settings);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Enable or disable scheduled checks
  const toggleScheduledChecks = async (enable: boolean) => {
    if (enable) {
      // Start scheduled checks
      setIsScheduled(true);
      localStorage.setItem('violationChecksEnabled', 'true');
      
      // Start the first check cycle
      scheduleNextCheck();
      
      toast({
        title: "Daily checks enabled",
        description: `Violation checks will run daily at 6 AM PST. Next check: ${nextCheckTime?.toLocaleString() || 'calculating...'}`,
      });
    } else {
      // Disable scheduled checks
      setIsScheduled(false);
      localStorage.setItem('violationChecksEnabled', 'false');
      
      // Clear any pending timeouts
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
    const settings: AppSettings = {
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
    
    // Save settings to localStorage
    localStorage.setItem('emailReportsEnabled', String(enabled));
    if (email) localStorage.setItem('emailReportAddress', email);
    
    // Save settings to Supabase
    const settings: AppSettings = {
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
  
  // Initialize on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      // Initialize the email service
      initEmailService();
      
      // Try to fetch settings from Supabase
      const settings = await fetchSettings();
      
      if (settings) {
        // Use settings from Supabase
        setIsScheduled(settings.violationChecksEnabled);
        setEmailEnabled(settings.emailReportsEnabled);
        if (settings.emailReportAddress) setEmailAddress(settings.emailReportAddress);
        
        // Save to localStorage for better performance on future loads
        localStorage.setItem('violationChecksEnabled', String(settings.violationChecksEnabled));
        localStorage.setItem('emailReportsEnabled', String(settings.emailReportsEnabled));
        if (settings.emailReportAddress) localStorage.setItem('emailReportAddress', settings.emailReportAddress);
        
        // If there's a saved next check time
        if (settings.nextViolationCheckTime) {
          try {
            const nextCheck = new Date(settings.nextViolationCheckTime);
            setNextCheckTime(nextCheck);
            localStorage.setItem('nextViolationCheckTime', settings.nextViolationCheckTime);
          } catch (e) {
            console.error('Invalid next check time format', e);
          }
        }
      }
      
      setIsInitialized(true);
      
      // If checks are enabled (either from Supabase or localStorage fallback)
      if (settings?.violationChecksEnabled || initialIsScheduled) {
        // Try to recover the next check time from localStorage or Supabase
        const savedNextCheckTime = settings?.nextViolationCheckTime || 
                                  localStorage.getItem('nextViolationCheckTime');
        
        if (savedNextCheckTime) {
          const nextCheck = new Date(savedNextCheckTime);
          setNextCheckTime(nextCheck);
          
          // If the saved next check time is in the past, run a check now
          if (nextCheck < new Date()) {
            checkForViolations();
          } else {
            // Otherwise, schedule for the saved time
            const msUntilNextCheck = nextCheck.getTime() - new Date().getTime();
            const timeoutId = setTimeout(checkForViolations, msUntilNextCheck);
            localStorage.setItem('violationCheckTimeoutId', String(timeoutId));
            
            return () => clearTimeout(timeoutId);
          }
        } else {
          // No saved next check time, schedule a new one
          return scheduleNextCheck();
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
  }, [isInitialized, initialIsScheduled]);
  
  return {
    isScheduled,
    lastCheckTime,
    nextCheckTime,
    emailEnabled,
    emailAddress,
    toggleScheduledChecks,
    checkForViolations,
    updateEmailSettings
  };
}
