import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path('./src'),
      '#airo/secrets': path('./tests/agent18/secrets.ts'),
    },
  },
  test: {
    include: ['tests/agent18/*.test.ts', 'src/lib/auth/safe-redirect.test.ts', 'src/lib/auth/auth-client.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
