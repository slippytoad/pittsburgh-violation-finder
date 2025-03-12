
import { createRoot } from 'react-dom/client'
import { Button } from '@/components/ui/button'
import App from './App.tsx'
import './index.css'
import { resetDatabase, runTableInitialization } from './utils/supabase'
import { useToast } from './components/ui/use-toast'
import { Toaster } from './components/ui/toaster'

// Create a debug component with reset functionality
const DebugTools = () => {
  const { toast } = useToast();
  
  const handleReset = async () => {
    const result = await resetDatabase();
    if (result) {
      toast({
        title: "Reset successful",
        description: "Database and localStorage have been reset to default values",
      });
      // Reload the page to apply changes
      window.location.reload();
    } else {
      toast({
        title: "Reset failed",
        description: "Failed to reset database. Check console for details.",
        variant: "destructive"
      });
    }
  };
  
  const handleInit = async () => {
    await runTableInitialization();
    toast({
      title: "Initialization triggered",
      description: "Check console for details",
    });
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <Button variant="outline" size="sm" onClick={handleInit}>
        Init DB
      </Button>
      <Button variant="destructive" size="sm" onClick={handleReset}>
        Reset App
      </Button>
    </div>
  );
};

// Wrap the App component with the debug tools
const AppWithDebug = () => (
  <>
    <App />
    <DebugTools />
    <Toaster />
  </>
);

createRoot(document.getElementById("root")!).render(<AppWithDebug />);
