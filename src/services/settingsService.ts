
import { supabase } from '@/utils/supabase';
import type { AppSettings } from '@/utils/types';

/**
 * Fetch app settings directly from Supabase
 * @returns The app settings or null if there's an error
 */
export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
      
    if (error) {
      console.error('Failed to fetch settings from Supabase:', error);
      return null;
    }
    
    if (!data) {
      console.log('No settings found in database');
      return null;
    }
    
    // Transform the data from snake_case (database) to camelCase (frontend)
    return {
      id: data.id,
      violationChecksEnabled: data.violation_checks_enabled,
      emailReportsEnabled: data.email_reports_enabled,
      emailReportAddress: data.email_report_address,
      nextViolationCheckTime: data.next_violation_check_time,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
};

/**
 * Save app settings directly to Supabase
 * @param settings The settings to save
 * @returns Whether the save was successful
 */
export const saveSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
  try {
    // Transform from camelCase to snake_case for the database
    const dbSettings: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that are provided in the settings object
    if (settings.violationChecksEnabled !== undefined) {
      dbSettings.violation_checks_enabled = settings.violationChecksEnabled;
    }
    
    if (settings.emailReportsEnabled !== undefined) {
      dbSettings.email_reports_enabled = settings.emailReportsEnabled;
    }
    
    if (settings.emailReportAddress !== undefined) {
      dbSettings.email_report_address = settings.emailReportAddress;
    }
    
    if (settings.nextViolationCheckTime !== undefined) {
      dbSettings.next_violation_check_time = settings.nextViolationCheckTime;
    }
    
    const { error } = await supabase
      .from('app_settings')
      .update(dbSettings)
      .eq('id', 1);
      
    if (error) {
      console.error('Failed to save settings to Supabase:', error);
      return false;
    }
    
    console.log('Settings saved successfully:', settings);
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};
