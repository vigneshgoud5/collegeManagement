#!/usr/bin/env node
/**
 * Wrapper script to allow --reporter=basic to work
 * Usage: node scripts/vitest-basic.js [other vitest args]
 * Or: npm run test:run -- --reporter=basic (will use this script)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Replace --reporter=basic with the actual reporter path
const args = process.argv.slice(2).map(arg => {
  if (arg === '--reporter=basic' || arg.startsWith('--reporter=basic')) {
    return '--reporter=./src/test/reporters/basic.ts';
  }
  return arg;
});

// Run vitest with modified args
const vitest = spawn('npx', ['vitest', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: resolve(__dirname, '..'),
});

vitest.on('exit', (code) => {
  process.exit(code || 0);
});
