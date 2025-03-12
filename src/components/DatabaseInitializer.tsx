
import React, { useEffect } from 'react';
import { initSupabaseTables } from '@/utils/supabase';

const DatabaseInitializer: React.FC = () => {
  useEffect(() => {
    const initTables = async () => {
      try {
        await initSupabaseTables();
      } catch (error) {
        console.error('Failed to initialize Supabase tables:', error);
      }
    };
    
    initTables();
  }, []);

  return null;
};

export default DatabaseInitializer;
