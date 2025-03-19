
import { fetchSettings, saveSettings as apiSaveSettings } from '@/utils/api';
import type { AppSettings } from '@/utils/types';

/**
 * Fetch app settings from the API
 * @returns The app settings or null if there's an error
 */
export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const settings = await fetchSettings();
    return settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
};

/**
 * Save app settings to the API
 * @param settings The settings to save
 * @returns Whether the save was successful
 */
export const saveSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
  try {
    const success = await apiSaveSettings(settings);
    return success;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};
