import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // The source directory name contains an ampersand. Disabling Fast Refresh
  // avoids Vite's dev-only refresh preamble issue for that URL while retaining
  // normal React rendering and production builds.
  plugins: [react({ fastRefresh: false })],
  // React source files live in a nested legacy folder. Without deduping,
  // Vite can resolve React once from that folder and once from the project
  // root, which causes the "Invalid hook call" blank screen.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // Keep the development server on a predictable local address and open the
    // actual Campus360 entry page instead of an accidental nested project.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: '/',
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
        money: fileURLToPath(new URL('./Money Management/index.html', import.meta.url)),
      },
    },
  },
});
