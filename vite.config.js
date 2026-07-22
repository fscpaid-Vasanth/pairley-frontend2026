import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// Vercel exposes this at build time (not to client code) so release tags
// line up with the actual deployed commit with zero manual configuration.
const releaseSha = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uploads sourcemaps to Sentry for readable stack traces, then strips
    // them from the deployed bundle so they aren't publicly served.
    // No-ops (with a warning, doesn't fail the build) until SENTRY_ORG /
    // SENTRY_PROJECT / SENTRY_AUTH_TOKEN are set in the build environment.
    process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: releaseSha },
        sourcemaps: {
          filesToDeleteAfterUpload: ['**/*.map'],
        },
        telemetry: false,
      }),
  ],

  define: {
    'import.meta.env.VITE_RELEASE_SHA': JSON.stringify(releaseSha),
  },

  server: {
    historyApiFallback: true,
  },

  // Build optimisations — compatible with Vite 8 / rolldown
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Raise warning threshold slightly
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a FUNCTION, not an object
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/react-helmet-async')) {
            return 'seo-vendor';
          }
        },
      },
    },

    // Minify with OXC — Vite 8's built-in native minifier (esbuild no longer bundled)
    minify: 'oxc',

    // Sourcemaps are generated so Sentry can symbolicate stack traces, but
    // "hidden" omits the //# sourceMappingURL comment so browsers/users
    // never auto-fetch them — the Sentry plugin above uploads then deletes
    // the .map files from the deployed bundle each build.
    sourcemap: 'hidden',

    // CSS code splitting
    cssCodeSplit: true,

    // Inline assets smaller than 4 KB
    assetsInlineLimit: 4096,
  },

  // Speed up cold starts in dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
  },

  // Module 12 Phase 3 — first test setup in this repo. jsdom is needed
  // since adminFilePreview.js reads localStorage; scope is deliberately
  // just src/**/*.test.js (pure-logic unit tests), not a full
  // component/RTL setup.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
});
