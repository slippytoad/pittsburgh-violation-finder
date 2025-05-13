
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ScheduledCheckProvider } from './contexts/ScheduledCheckContext'

createRoot(document.getElementById("root")!).render(
  <ScheduledCheckProvider>
    <App />
  </ScheduledCheckProvider>
);

