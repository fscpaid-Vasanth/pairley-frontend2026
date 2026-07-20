import './instrument';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.jsx';
import ErrorFallback from './components/ErrorFallback.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HelmetProvider wraps the entire app for react-helmet-async (SEO Step 10) */}
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <App />
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);

