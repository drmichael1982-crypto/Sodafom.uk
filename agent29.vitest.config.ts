import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));
export default defineConfig({
  resolve: { alias: { '@': path('./src'), '#airo/secrets': path('./tests/agent29/secrets.ts') } },
  esbuild: { jsx: 'automatic' },
  test: {
    include: process.env.AGENT29_TEST_DB === '1'
      ? ['tests/agent29/*.test.ts', 'tests/agent29/*.test.tsx']
      : ['tests/agent29/*.test.tsx'],
    environment: 'node', fileParallelism: false, testTimeout: 30_000, hookTimeout: 60_000,
  },
});
