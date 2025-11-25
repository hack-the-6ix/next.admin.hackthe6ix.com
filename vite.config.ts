import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build/client',
    emptyOutDir: true,
  },
  resolve: {
    // Prevent resolving from parent node_modules
    dedupe: ['react', 'react-dom', 'react-router'],
    alias: {
      // In React Router v7, react-router-dom is merged into react-router
      'react-router-dom': 'react-router',
    },
  },
});
