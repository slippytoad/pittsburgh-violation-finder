
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/toaster'

// Render the app without debug tools
const AppWithToaster = () => (
  <>
    <App />
    <Toaster />
  </>
);

createRoot(document.getElementById("root")!).render(<AppWithToaster />);
