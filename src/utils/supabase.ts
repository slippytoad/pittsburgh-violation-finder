
import { createClient } from '@supabase/supabase-js';

// Use environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdjfzjqhnhrlkpqdtssp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkamZ6anFobmhybGtwcWR0c3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTcyMDUsImV4cCI6MjA1NzMzMzIwNX0.KSREpeFWe08W1bdY1GPxUEol9_Gd3PRqT37HIXl4_r4';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export the AppSettings type
export interface AppSettings {
  id?: number;
  violationChecksEnabled: boolean;
  emailReportsEnabled: boolean;
  emailReportAddress: string;
  nextViolationCheckTime?: string;
  created_at?: string;
  updated_at?: string;
}

// Function to create necessary tables if they don't exist
export const initSupabaseTables = async () => {
  try {
    // Check if the app_settings table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log('The app_settings table does not exist. Creating it...');
      
      // Create the app_settings table using SQL
      const { error: createTableError } = await supabase.rpc('create_app_settings_table');
      
      if (createTableError) {
        console.error('Failed to create app_settings table:', createTableError);
        
        // Fallback: try to insert a record anyway, which might auto-create the table
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            violationChecksEnabled: false,
            emailReportsEnabled: false,
            emailReportAddress: '',
          });
          
        if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
          console.error('Could not initialize app_settings table:', insertError);
        } else {
          console.log('app_settings table initialized successfully');
        }
      } else {
        console.log('app_settings table created successfully');
      }
    } else {
      console.log('app_settings table already exists');
    }
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
};

// Export the Address type from the types file
export type { Address } from './types';

// Log to confirm client creation
console.log('Supabase client initialized');
