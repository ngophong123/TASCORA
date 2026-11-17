import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web/src"),
    },
  },
  test: {
    include: ["tests/api/**/*.spec.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    globals: true,
    environment: "node",
    // Keep API integration concurrency bounded so first-time Vite module transforms
    // and cost-12 bcrypt hashing in parallel suites do not starve worker event loops.
    maxWorkers: 2,
  },
});
