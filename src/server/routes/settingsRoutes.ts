
import { Request, Response } from 'express';
import { supabase } from '../../utils/supabase';

interface AppSettingsUpdate {
  violationChecksEnabled?: boolean;
  emailReportsEnabled?: boolean;
  emailReportAddress?: string;
  nextViolationCheckTime?: string;
}

// Get app settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Transform database record to AppSettings type
    const settings = {
      id: data.id,
      violationChecksEnabled: data.violation_checks_enabled,
      emailReportsEnabled: data.email_reports_enabled,
      emailReportAddress: data.email_report_address || '',
      nextViolationCheckTime: data.next_violation_check_time,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update app settings
export const updateSettings = async (req: Request<{}, any, AppSettingsUpdate>, res: Response) => {
  try {
    const settings = req.body;
    
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
      if (formattedSettings[key as keyof typeof formattedSettings] === undefined) {
        delete formattedSettings[key as keyof typeof formattedSettings];
      }
    });

    // First check if the record exists
    const { data: existingData, error: checkError } = await supabase
      .from('app_settings')
      .select('id')
      .eq('id', 1)
      .single();

    if (checkError) {
      // If the record doesn't exist, try to create it
      if (checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            ...formattedSettings
          });

        if (insertError) throw insertError;
        
        res.json(true);
        return;
      }
      throw checkError;
    }

    // Record exists, update it
    const { error: updateError } = await supabase
      .from('app_settings')
      .update(formattedSettings)
      .eq('id', 1);
    
    if (updateError) throw updateError;
    
    res.json(true);
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
};
