
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
    
    // Use RPC to create the table directly with SQL
    // This is more reliable than checking if the table exists first
    const { error } = await supabase.rpc('create_app_settings_table');
    
    if (error) {
      console.log('Error with RPC call, falling back to SQL script execution');
      
      // Try to query the table to see if it exists
      const { error: queryError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);
        
      if (queryError && queryError.code === '42P01') {
        // Table doesn't exist, try to create it using direct SQL
        console.log('Table does not exist. Attempting to create manually.');
        
        // Log SQL that would need to be run manually
        console.warn('Please run the following SQL in your Supabase SQL Editor to create the required table:');
        console.warn(`
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  violation_checks_enabled BOOLEAN DEFAULT false,
  email_reports_enabled BOOLEAN DEFAULT false,
  email_report_address TEXT DEFAULT '',
  next_violation_check_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default settings record if it doesn't exist
INSERT INTO app_settings (
  id,
  violation_checks_enabled, 
  email_reports_enabled, 
  email_report_address
)
VALUES (
  1, false, false, ''
)
ON CONFLICT (id) DO NOTHING;
        `);
        
        // Try to create through direct table operations as a last resort
        console.log('Attempting to create through direct operations...');
        await createTableWithDirectOperations();
      } else if (queryError) {
        console.error('Error querying app_settings table:', queryError);
      } else {
        console.log('app_settings table exists, but RPC call failed. Table may already be set up.');
      }
    } else {
      console.log('app_settings table created successfully via RPC');
    }
    
    // Verify the table exists and has data
    const { data, error: verifyError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1);
      
    if (verifyError) {
      console.error('Table verification failed:', verifyError);
    } else {
      console.log('Table verification successful. Data:', data);
      if (!data || data.length === 0) {
        console.log('No data in app_settings table. Adding default record...');
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            violation_checks_enabled: false,
            email_reports_enabled: false,
            email_report_address: '',
            next_violation_check_time: null
          });
          
        if (insertError) {
          console.error('Error inserting default record:', insertError);
        } else {
          console.log('Default record added successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
};

// Helper function to create table with direct operations
const createTableWithDirectOperations = async () => {
  try {
    // Try to insert a record, which will fail if the table doesn't exist
    const { error: insertError } = await supabase
      .from('app_settings')
      .insert({
        id: 1,
        violation_checks_enabled: false,
        email_reports_enabled: false,
        email_report_address: '',
        next_violation_check_time: null
      });
      
    if (insertError && insertError.code === '42P01') {
      console.error('Table does not exist and cannot be created through direct operations');
    } else if (insertError) {
      console.error('Error inserting into app_settings:', insertError);
    } else {
      console.log('app_settings record inserted successfully');
    }
  } catch (error) {
    console.error('Error in createTableWithDirectOperations:', error);
  }
};

// Function to manually run the initialization - can be called from components
export const runTableInitialization = () => {
  console.log('Manually running table initialization...');
  return initSupabaseTables();
};

// Add a simple function to reset the database to initial state
export const resetDatabase = async () => {
  try {
    // Instead of deleting, update the single record
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        violation_checks_enabled: false,
        email_reports_enabled: false,
        email_report_address: '',
        next_violation_check_time: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
      
    if (updateError) {
      console.error('Error updating app_settings record:', updateError);
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

// Initialize tables when this file is imported
initSupabaseTables()
  .then(() => console.log('Database tables initialization complete'))
  .catch(err => console.error('Failed to initialize database tables:', err));

// Log to confirm client creation
console.log('Supabase client initialized');
