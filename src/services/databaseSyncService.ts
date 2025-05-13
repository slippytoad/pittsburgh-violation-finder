
/**
 * Service for scheduled database synchronization
 */
import { syncViolationsDatabase } from '@/utils/dataSync';
import { saveSettings, fetchAppSettings } from '@/services/settingsService';
import { useToast } from '@/components/ui/use-toast';

// Constants for synchronization scheduling
const SYNC_HOUR = 2; // 2 AM local time for minimal disruption

/**
 * Calculate the next synchronization time
 * @returns Date object representing the next sync time
 */
export const getNextSyncTime = (): Date => {
  const now = new Date();
  const nextSync = new Date();
  
  // Set to 2 AM
  nextSync.setHours(SYNC_HOUR, 0, 0, 0);
  
  // If it's already past 2 AM, schedule for tomorrow
  if (now > nextSync) {
    nextSync.setDate(nextSync.getDate() + 1);
  }
  
  return nextSync;
};

/**
 * Schedule the next database synchronization
 * @returns A cleanup function to cancel the scheduled sync
 */
export const scheduleNextDatabaseSync = (
  onSyncComplete?: (result: { added: number }) => void
): (() => void) => {
  const nextSync = getNextSyncTime();
  const msUntilSync = nextSync.getTime() - new Date().getTime();
  
  console.log(`Next database sync scheduled for ${nextSync.toLocaleString()} (in ${Math.round(msUntilSync / 1000 / 60)} minutes)`);
  
  const timeoutId = setTimeout(async () => {
    try {
      console.log('Starting scheduled database synchronization...');
      const result = await syncViolationsDatabase();
      console.log(`Database sync complete. Added ${result.added} violations.`);
      
      // Update next sync time in settings
      const settings = await fetchAppSettings();
      if (settings) {
        await saveSettings({
          ...settings,
          lastDatabaseSyncTime: new Date().toISOString(),
          nextDatabaseSyncTime: getNextSyncTime().toISOString()
        });
      }
      
      // Notify the callback if provided
      if (onSyncComplete) {
        onSyncComplete(result);
      }
      
      // Schedule the next sync
      scheduleNextDatabaseSync(onSyncComplete);
    } catch (error) {
      console.error('Error during scheduled database synchronization:', error);
      // Still schedule the next sync even if this one failed
      scheduleNextDatabaseSync(onSyncComplete);
    }
  }, msUntilSync);
  
  // Store the timeout ID in localStorage for recovery on page refresh
  localStorage.setItem('databaseSyncTimeoutId', String(timeoutId));
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    localStorage.removeItem('databaseSyncTimeoutId');
  };
};

/**
 * Initialize database synchronization
 * This should be called when the app starts
 */
export const initDatabaseSync = (onSyncComplete?: (result: { added: number }) => void): (() => void) => {
  console.log('Initializing database synchronization...');
  return scheduleNextDatabaseSync(onSyncComplete);
};

/**
 * Manually trigger a database synchronization
 * @returns The result of the synchronization
 */
export const manualSyncDatabase = async (): Promise<{ added: number }> => {
  console.log('Starting manual database synchronization...');
  try {
    const result = await syncViolationsDatabase();
    
    // Update last sync time in settings
    const settings = await fetchAppSettings();
    if (settings) {
      await saveSettings({
        ...settings,
        lastDatabaseSyncTime: new Date().toISOString()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error during manual database synchronization:', error);
    throw error;
  }
};
