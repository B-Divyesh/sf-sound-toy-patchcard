import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['browser-tests/**', 'node_modules/**', 'dist/**'],
    coverage: { include: ['src/**/*.ts'] }
  }
});
