import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

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

    // No source maps in production
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: true,

    // Inline assets smaller than 4 KB
    assetsInlineLimit: 4096,
  },

  // Speed up cold starts in dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
  },
});
