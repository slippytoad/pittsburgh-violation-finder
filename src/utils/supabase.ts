
import { createClient } from '@supabase/supabase-js';
import type { AppSettings, Address } from './types';

// Use environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdjfzjqhnhrlkpqdtssp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkamZ6anFobmhybGtwcWR0c3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTcyMDUsImV4cCI6MjA1NzMzMzIwNX0.KSREpeFWe08W1bdY1GPxUEol9_Gd3PRqT37HIXl4_r4';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create necessary tables if they don't exist
export const initSupabaseTables = async () => {
  try {
    console.log('Starting Supabase tables initialization...');
    
    // Create the app_settings table using SQL query
    const { error: createTableError } = await supabase.rpc(
      'exec_sql', 
      { 
        query: `
          CREATE TABLE IF NOT EXISTS app_settings (
            id SERIAL PRIMARY KEY,
            violation_checks_enabled BOOLEAN DEFAULT false,
            email_reports_enabled BOOLEAN DEFAULT false,
            email_report_address TEXT DEFAULT '',
            next_violation_check_time TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Add default settings record if none exists
          INSERT INTO app_settings (
            violation_checks_enabled, 
            email_reports_enabled, 
            email_report_address
          )
          SELECT false, false, ''
          WHERE NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1);

          -- Create function to update the 'updated_at' timestamp
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
             NEW.updated_at = NOW();
             RETURN NEW;
          END;
          $$ LANGUAGE 'plpgsql';

          -- Create trigger to update 'updated_at' automatically
          DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
          CREATE TRIGGER update_app_settings_updated_at
          BEFORE UPDATE ON app_settings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `
      }
    );
    
    if (createTableError) {
      console.error('Failed to create app_settings table with SQL query:', createTableError);
      
      // Fallback: try to check if the table exists via SELECT
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (tableCheckError && tableCheckError.code === 'PGRST116') {
        console.log('The app_settings table does not exist. Creating it with fallback method...');
        
        // Fallback: try to insert a record anyway, which might auto-create the table
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            violation_checks_enabled: false,
            email_reports_enabled: false,
            email_report_address: '',
          });
          
        if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
          console.error('Could not initialize app_settings table:', insertError);
        } else {
          console.log('app_settings table initialized successfully');
        }
      } else {
        console.log('app_settings table already exists');
      }
    } else {
      console.log('app_settings table created or confirmed successfully');
    }
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
};

// Function to manually run the initialization - can be called from components
export const runTableInitialization = () => {
  console.log('Manually running table initialization...');
  return initSupabaseTables();
};

// Initialize tables when this file is imported
initSupabaseTables()
  .then(() => console.log('Database tables initialization complete'))
  .catch(err => console.error('Failed to initialize database tables:', err));

// Log to confirm client creation
console.log('Supabase client initialized');
