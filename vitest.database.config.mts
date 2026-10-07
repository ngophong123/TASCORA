import { defineConfig } from 'vitest/config';
export default defineConfig({
  envDir: false,
  resolve: { alias: [{ find: /^@prisma\/client$/, replacement: process.env.TASCORA_VALIDATION_CLIENT || '@prisma/client' }] },
  test: { include: ['tests/database/**/*.spec.ts'], environment: 'node', fileParallelism: false, testTimeout: 30000, hookTimeout: 30000 },
});
