
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { scheduleNextCheck, processViolationResults } from '@/services/violationCheckService';
import type { AppSettings } from '@/utils/types';

interface ViolationCheckState {
  lastCheckTime: Date | null;
  nextCheckTime: Date | null;
}

export const useViolationCheck = (
  handleSearchAll: (addresses: string[]) => Promise<void>,
  addresses: string[],
  isScheduled: boolean,
  emailEnabled: boolean,
  emailAddress: string
) => {
  const [state, setState] = useState<ViolationCheckState>({
    lastCheckTime: null,
    nextCheckTime: null
  });
  const { toast } = useToast();

  const checkForViolations = async () => {
    if (addresses.length === 0) {
      console.log('No addresses to check for violations');
      return;
    }
    
    console.log('Checking for new violations', new Date().toLocaleString());
    setState(prev => ({ ...prev, lastCheckTime: new Date() }));
    
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
      setState(prev => ({ ...prev, nextCheckTime: new Date(nextCheckTimeStr) }));
    }
    
    return cleanup;
  };

  return {
    lastCheckTime: state.lastCheckTime,
    nextCheckTime: state.nextCheckTime,
    checkForViolations
  };
};
