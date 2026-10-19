import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ScheduleProvider } from './context/ScheduleContext.jsx';
import '@styles/smartCampusUI.css';
import './themes/frutiger.css';
import './themes/halloween.css';
import './themes/autumn.css';
import './themes/christmas.css';
import App from '@app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ScheduleProvider>
            <App />
          </ScheduleProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
