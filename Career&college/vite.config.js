import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// This folder contains the React source, but the complete Campus360 app lives
// one level up alongside the Money Management dashboard.  Using that directory
// as Vite's root prevents `/Money%20Management/index.html` from falling back to
// this app and recursively embedding another sidebar.
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  // See the root config: this keeps React rendering stable when Vite serves
  // source files from the `Career&college` directory during development.
  plugins: [react({ fastRefresh: false })],
  // Always use the root copy of React and React DOM.  This prevents a second
  // dispatcher being loaded from `Career&college/node_modules`.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('../index.html', import.meta.url)),
        money: fileURLToPath(new URL('../Money Management/index.html', import.meta.url)),
      },
    },
  },
});
