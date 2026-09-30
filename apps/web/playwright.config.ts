import { defineConfig, devices } from "@playwright/test";

/**
 * Homepage regression suite (WP4). Runs against a PRODUCTION build (`next build` + `next start`) made with NEXT_PUBLIC_E2E=1, which switches on the
 * test-only `window.__sz` hooks (src/lib/e2e-hooks.ts). Nothing here sets `reducedMotion`: the real animations run; the hooks freeze the clock instead.
 *
 * Screenshots: see e2e/home.spec.ts. Baselines are per platform (the `{platform}` suffix below); only the platform they were generated on is compared.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{platform}/{arg}{ext}",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1, // one production server, GPU-less WebGL: parallel pages fight over the CPU and make the frame-driven parts flaky
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // Calibrated (see e2e/home.spec.ts header): with the fake clock a re-run is byte-identical except 2-150 anti-aliasing pixels in WebGL/canvas frames
      // (max seen 151 of 1.3M = 0.0001). 0.001 leaves ~8x headroom for that noise and still fails on a moved 60x20 px element.
      maxDiffPixelRatio: 0.001,
    },
  },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    colorScheme: "dark",
    locale: "en-GB",
    timezoneId: "UTC",
  },
  projects: [
    {
      name: "phone",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT} -H 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 600_000,
    env: { NEXT_PUBLIC_E2E: "1", NEXT_TELEMETRY_DISABLED: "1", PORT: String(PORT) },
  },
});
