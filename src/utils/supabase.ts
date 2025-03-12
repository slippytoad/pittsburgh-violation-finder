
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
    
    // Check if app_settings table exists
    const { error: tableCheckError } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log('The app_settings table does not exist. Creating it...');
      
      // Create the app_settings table using SQL (via the SQL editor in the Supabase dashboard)
      // This requires you to manually run this SQL in your Supabase SQL editor once:
      /*
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
      */
      
      // Since we can't run SQL directly, let's try to create through insertion
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          violation_checks_enabled: false,
          email_reports_enabled: false,
          email_report_address: '',
          next_violation_check_time: null
        });
        
      if (insertError) {
        console.error('Failed to initialize app_settings table:', insertError);
        
        // Show instructions to the user
        console.warn('Please run the following SQL in your Supabase SQL Editor to create the required table:');
        console.warn(`
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
        `);
      } else {
        console.log('app_settings table initialized successfully');
      }
    } else {
      console.log('app_settings table already exists');
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

// Add a simple function to reset the database to initial state
export const resetDatabase = async () => {
  try {
    // Delete all records from app_settings
    const { error: deleteError } = await supabase
      .from('app_settings')
      .delete()
      .neq('id', 0); // Delete all records
      
    if (deleteError) {
      console.error('Error deleting app_settings records:', deleteError);
      return false;
    }
    
    // Insert the default record
    const { error: insertError } = await supabase
      .from('app_settings')
      .insert({
        violation_checks_enabled: false,
        email_reports_enabled: false,
        email_report_address: '',
        next_violation_check_time: null
      });
      
    if (insertError) {
      console.error('Error inserting default app_settings record:', insertError);
      return false;
    }
    
    // Clear localStorage
    localStorage.removeItem('violationChecksEnabled');
    localStorage.removeItem('emailReportsEnabled');
    localStorage.removeItem('emailReportAddress');
    localStorage.removeItem('nextViolationCheckTime');
    localStorage.removeItem('violationCheckTimeoutId');
    
    console.log('Database and localStorage reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};

// Log to confirm client creation
console.log('Supabase client initialized');
