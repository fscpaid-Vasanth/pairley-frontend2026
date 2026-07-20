// Must be imported before anything else in main.jsx so Sentry's browser
// integrations (global error/rejection handlers) are attached before any
// other code can run.
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE_SHA || undefined,
    tracesSampleRate: 0.1,
    // Don't attach IP/cookies by default — errors are correlated to a
    // backend request via the x-request-id tag below instead of PII.
    sendDefaultPii: false,
    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (error && typeof error === 'object' && 'correlationId' in error) {
        event.tags = { ...event.tags, correlationId: error.correlationId };
      }
      return event;
    },
  });
}
