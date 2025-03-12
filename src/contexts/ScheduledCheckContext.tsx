import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { 
  fetchSettings, 
  saveSettings,
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage
} from '@/services/settingsService';
import {
  initializeEmailService,
  scheduleNextCheck,
  processViolationResults
} from '@/services/violationCheckService';
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
  
  const [isScheduled, setIsScheduled] = useState<boolean>(!!initialSettings.violationChecksEnabled);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(!!initialSettings.emailReportsEnabled);
  const [emailAddress, setEmailAddress] = useState<string>(initialSettings.emailReportAddress || '');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const { handleSearchAll } = useViolations();
  const { addresses } = useAddresses();
  const { toast } = useToast();
  
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
      const patchedHandleSearchAll = async () => {
        // Listen for state updates on the violations
        const checkInterval = setInterval(() => {
          // Get the violations from the DOM or localStorage if available
          const violationsElement = document.getElementById('violations-data');
          if (violationsElement && violationsElement.textContent) {
            try {
              const violations = JSON.parse(violationsElement.textContent);
              clearInterval(checkInterval);
              
              processViolationResults(violations, emailEnabled, emailAddress, toast);
              
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
    const cleanup = scheduleNextCheck({ 
      violationChecksEnabled: isScheduled,
      emailReportsEnabled: emailEnabled,
      emailReportAddress: emailAddress
    }, checkForViolations);
    
    // Set the next check time for UI
    const nextCheckTimeStr = localStorage.getItem('nextViolationCheckTime');
    if (nextCheckTimeStr) {
      setNextCheckTime(new Date(nextCheckTimeStr));
    }
    
    return cleanup;
  };
  
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
  
  // Initialize on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initialize = async () => {
      // Initialize the email service
      initializeEmailService();
      
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
  }, [isInitialized, initialSettings.violationChecksEnabled]);
  
  const value = {
    isScheduled,
    lastCheckTime,
    nextCheckTime,
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
