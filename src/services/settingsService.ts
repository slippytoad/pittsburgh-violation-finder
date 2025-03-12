
import { supabase } from '@/utils/supabase';
import type { AppSettings } from '@/utils/types';

/**
 * Fetch app settings from Supabase
 * @returns The app settings or null if there's an error
 */
export const fetchSettings = async (): Promise<AppSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
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

/**
 * Save app settings to Supabase
 * @param settings The settings to save
 * @returns Whether the save was successful
 */
export const saveSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
  try {
    // Always use id=1 for the single settings record
    const { error } = await supabase
      .from('app_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
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

/**
 * Load settings from localStorage
 * @returns AppSettings object with values from localStorage
 */
export const loadSettingsFromLocalStorage = (): Partial<AppSettings> => {
  return {
    violationChecksEnabled: localStorage.getItem('violationChecksEnabled') === 'true',
    emailReportsEnabled: localStorage.getItem('emailReportsEnabled') === 'true',
    emailReportAddress: localStorage.getItem('emailReportAddress') || '',
    nextViolationCheckTime: localStorage.getItem('nextViolationCheckTime') || undefined
  };
};

/**
 * Save settings to localStorage
 * @param settings The settings to save
 */
export const saveSettingsToLocalStorage = (settings: Partial<AppSettings>): void => {
  if (settings.violationChecksEnabled !== undefined) {
    localStorage.setItem('violationChecksEnabled', String(settings.violationChecksEnabled));
  }
  
  if (settings.emailReportsEnabled !== undefined) {
    localStorage.setItem('emailReportsEnabled', String(settings.emailReportsEnabled));
  }
  
  if (settings.emailReportAddress) {
    localStorage.setItem('emailReportAddress', settings.emailReportAddress);
  }
  
  if (settings.nextViolationCheckTime) {
    localStorage.setItem('nextViolationCheckTime', settings.nextViolationCheckTime);
  }
};
