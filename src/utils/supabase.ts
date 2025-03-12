
import { createClient } from '@supabase/supabase-js';

// Set Supabase URL and key directly
const supabaseUrl = 'https://qdjfzjqhnhrlkpqdtssp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkamZ6anFobmhybGtwcWR0c3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTcyMDUsImV4cCI6MjA1NzMzMzIwNX0.KSREpeFWe08W1bdY1GPxUEol9_Gd3PRqT37HIXl4_r4';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for our database structure
export interface Address {
  id: number;
  address: string;
  created_at: string;
}

// Log to confirm client creation
console.log('Supabase client initialized');
