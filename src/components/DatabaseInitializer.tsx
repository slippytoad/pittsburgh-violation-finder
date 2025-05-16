
import React, { useEffect, useState } from 'react';
import { initSupabaseTables } from '@/utils/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { createHelperFunctions } from '@/utils/database/violationsDb';

const DatabaseInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initTables = async () => {
      try {
        setIsInitializing(true);
        const success = await initSupabaseTables();
        
        if (success) {
          // Make sure helper functions are created
          try {
            await createHelperFunctions();
          } catch (helperError) {
            console.error('Failed to create helper functions:', helperError);
          }
        } else {
          toast({
            title: "Database Initialization Failed",
            description: "Please check the console for details and try refreshing the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to initialize Supabase tables:', error);
        toast({
          title: "Database Error",
          description: "Failed to initialize the database. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    initTables();
  }, [toast]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Initializing database...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default DatabaseInitializer;
