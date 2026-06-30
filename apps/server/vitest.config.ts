import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    singleThread: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
