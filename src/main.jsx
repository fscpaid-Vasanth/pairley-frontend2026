import './instrument';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.jsx';
import ErrorFallback from './components/ErrorFallback.jsx';

// FCM web push — registered unconditionally (not gated on notification
// permission) so the service worker is already ready by the time a logged-in
// user's effect in App.jsx requests a push token; avoids a permission-
// granted-before-SW-ready race. Native (Capacitor) builds don't hit this
// file at all, so this is a no-op there.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .catch((err) => console.error('Service worker registration failed:', err));
}

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

