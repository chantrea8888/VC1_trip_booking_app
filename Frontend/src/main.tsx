import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { applyInitialTheme, ThemeProvider } from './theme';
import './index.css';

applyInitialTheme();

=======
import App from './App';
import './index.css';

>>>>>>> chantrea/feature-customer
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
