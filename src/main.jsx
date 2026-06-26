import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HelmetProvider wraps the entire app for react-helmet-async (SEO Step 10) */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
