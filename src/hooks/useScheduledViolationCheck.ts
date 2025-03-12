import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ViolationType } from '@/utils/types';
import { useViolations } from './useViolations';
import { useAddresses } from './useAddresses';

// Time to check for violations (6 AM PST)
const CHECK_HOUR_PST = 6;

// Convert PST hour to local time
const getPSTCheckTimeInLocalTime = (): Date => {
  const now = new Date();
  const localTime = new Date();
  
  // PST is UTC-8 (standard time) or UTC-7 (daylight saving time)
  // We'll use a simple approach to determine if DST is in effect
  const isDST = (): boolean => {
    // Simple check for DST in the US
    const januaryOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const julyOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(januaryOffset, julyOffset) !== now.getTimezoneOffset();
  };
  
  // PST/PDT offset in hours (negative means behind UTC)
  const pstOffset = isDST() ? -7 : -8;
  // Get local offset in hours (negative means behind UTC)
  const localOffset = -now.getTimezoneOffset() / 60;
  // Calculate the difference between local time and PST
  const hourDifference = localOffset - pstOffset;
  
  // Set the check time in local timezone
  localTime.setHours(CHECK_HOUR_PST + hourDifference);
  localTime.setMinutes(0);
  localTime.setSeconds(0);
  localTime.setMilliseconds(0);
  
  // If the calculated time is in the past for today, schedule for tomorrow
  if (localTime < now) {
    localTime.setDate(localTime.getDate() + 1);
  }
  
  return localTime;
};

// Calculate milliseconds until next check time
const getMillisecondsUntilNextCheck = (): number => {
  const nextCheckTime = getPSTCheckTimeInLocalTime();
  const now = new Date();
  return nextCheckTime.getTime() - now.getTime();
};

export function useScheduledViolationCheck() {
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const { handleSearchAll } = useViolations();
  const { addresses } = useAddresses();
  const { toast } = useToast();
  
  // Load previously known violations from localStorage
  const loadKnownViolations = (): Record<string, string[]> => {
    const saved = localStorage.getItem('knownViolations');
    return saved ? JSON.parse(saved) : {};
  };
  
  // Save known violations to localStorage
  const saveKnownViolations = (violations: Record<string, string[]>) => {
    localStorage.setItem('knownViolations', JSON.stringify(violations));
  };
  
  // Compare new violations with known ones and return only the new ones
  const filterNewViolations = (allViolations: ViolationType[]): ViolationType[] => {
    const knownViolations = loadKnownViolations();
    const newViolations: ViolationType[] = [];
    const updatedKnownViolations: Record<string, string[]> = { ...knownViolations };
    
    allViolations.forEach(violation => {
      const address = violation.address;
      const violationId = violation.id;
      
      // Initialize array for this address if it doesn't exist
      if (!updatedKnownViolations[address]) {
        updatedKnownViolations[address] = [];
      }
      
      // Check if this violation ID is known for this address
      if (!updatedKnownViolations[address].includes(violationId)) {
        newViolations.push(violation);
        updatedKnownViolations[address].push(violationId);
      }
    });
    
    // Save the updated known violations
    saveKnownViolations(updatedKnownViolations);
    
    return newViolations;
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
    localStorage.setItem('nextViolationCheckTime', nextCheck.toISOString());
    
    return () => clearTimeout(timeoutId);
  };
  
  // Enable or disable scheduled checks
  const toggleScheduledChecks = (enable: boolean) => {
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
  };
  
  // Initialize on mount
  useEffect(() => {
    // Load the scheduled state from localStorage
    const savedScheduledState = localStorage.getItem('violationChecksEnabled');
    const isCheckingEnabled = savedScheduledState === 'true';
    setIsScheduled(isCheckingEnabled);
    
    // If checks are enabled, schedule the next check
    if (isCheckingEnabled) {
      // Try to recover the next check time from localStorage
      const savedNextCheckTime = localStorage.getItem('nextViolationCheckTime');
      
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
    
    // Cleanup function
    return () => {
      const timeoutId = localStorage.getItem('violationCheckTimeoutId');
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
      }
    };
  }, []);
  
  return {
    isScheduled,
    lastCheckTime,
    nextCheckTime,
    toggleScheduledChecks,
    checkForViolations
  };
}
