import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration für Buchhandlung Angular App
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'https://localhost:4200',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Firefox und WebKit deaktiviert (nicht installiert)
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },
    ],

    webServer: {
        command: 'pnpm start',
        url: 'https://localhost:4200',
        reuseExistingServer: true,
        timeout: 120000,
        ignoreHTTPSErrors: true,
    },
});
