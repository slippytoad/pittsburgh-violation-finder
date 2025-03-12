import { supabase } from '@/utils/supabase';
import type { AppSettings } from '@/utils/types';

/**
 * Transform database record to AppSettings type
 */
const transformDatabaseRecord = (record: any): AppSettings => {
  return {
    id: record.id,
    violationChecksEnabled: record.violation_checks_enabled,
    emailReportsEnabled: record.email_reports_enabled,
    emailReportAddress: record.email_report_address || '',
    nextViolationCheckTime: record.next_violation_check_time,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
};

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
    
    if (!data) {
      console.log('No settings found in database');
      return null;
    }

    console.log('Raw database record:', data);
    const transformed = transformDatabaseRecord(data);
    console.log('Transformed settings:', transformed);
    
    return transformed;
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
    // Convert camelCase to snake_case and format the data
    const formattedSettings = {
      violation_checks_enabled: settings.violationChecksEnabled,
      email_reports_enabled: settings.emailReportsEnabled,
      email_report_address: settings.emailReportAddress,
      next_violation_check_time: settings.nextViolationCheckTime,
      updated_at: new Date().toISOString()
    };

    // Remove any undefined values
    Object.keys(formattedSettings).forEach(key => {
      if (formattedSettings[key] === undefined) {
        delete formattedSettings[key];
      }
    });

    console.log('Saving settings to database:', formattedSettings);

    // First check if the record exists
    const { data: existingData, error: checkError } = await supabase
      .from('app_settings')
      .select('id')
      .eq('id', 1)
      .single();

    if (checkError) {
      console.error('Error checking settings record:', checkError);
      // If the record doesn't exist, try to create it
      if (checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            ...formattedSettings
          });

        if (insertError) {
          console.error('Error creating settings record:', insertError);
          return false;
        }
        console.log('Created new settings record');
        return true;
      }
      return false;
    }

    // Record exists, update it
    const { error: updateError } = await supabase
      .from('app_settings')
      .update(formattedSettings)
      .eq('id', 1);
    
    if (updateError) {
      console.error('Error saving settings:', updateError);
      return false;
    }
    
    console.log('Updated existing settings record');
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};
