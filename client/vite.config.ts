import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: '/', // Vercel uses root path
  server: {
    port: 5173,
  },
  resolve: {
    dedupe: ['react', 'react-dom'], // Ensure single React instance
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router': path.resolve(__dirname, 'node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')],
    reporters: ['default'], // Valid reporters: 'default', 'verbose', 'dot', 'json', 'junit', './src/test/reporters/basic.ts'
    pool: 'forks',
    // Note: poolOptions was removed in Vitest 4, use top-level options instead
  },
});


