import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: [
      "tests/unit/**/*.spec.ts",
      "tests/api/**/*.spec.ts",
      "tests/security/**/*.spec.ts",
    ],
    exclude: ["tests/e2e/**", "node_modules/**"],
    globals: true,
    environment: "node",
  },
})
