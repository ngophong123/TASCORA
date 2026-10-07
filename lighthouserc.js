module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter web exec next start -p 3000",
      startServerReadyPattern: "Ready in|started server on|Listening on",
      startServerReadyTimeout: 60000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/services",
        "http://localhost:3000/services/srv-1",
      ],
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--no-sandbox --headless --disable-gpu --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.85 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
}
