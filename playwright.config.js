import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:41773",
    launchOptions: { executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] },
  },
  webServer: {
    command: "python3 -m http.server 41773 --bind 127.0.0.1",
    url: "http://127.0.0.1:41773/campus/",
    reuseExistingServer: true,
    timeout: 20000,
  },
});
