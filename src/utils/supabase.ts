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
    
    // First try to query the table to see if it exists
    const { error: queryError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1);
      
    if (queryError && queryError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('create_app_settings_table');
      
      if (createError) {
        console.error('Failed to create table via RPC:', createError);
        // Try direct SQL as fallback (this requires appropriate permissions)
        const { error: sqlError } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            violation_checks_enabled: false,
            email_reports_enabled: false,
            email_report_address: '',
            next_violation_check_time: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (sqlError) {
          console.error('Failed to create table via direct insert:', sqlError);
          return false;
        }
      }
    }
    
    // Verify the table exists and has the default record
    const { data, error: verifyError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
      
    if (verifyError) {
      console.error('Table verification failed:', verifyError);
      // Try to create the default record
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          id: 1,
          violation_checks_enabled: false,
          email_reports_enabled: false,
          email_report_address: '',
          next_violation_check_time: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Failed to create default record:', insertError);
        return false;
      }
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
    return false;
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
