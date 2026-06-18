import {defineConfig, devices} from '@playwright/test';

const isNative = process.env.PLAYWRIGHT_NATIVE === 'true';
const previewHost = '127.0.0.1';
const previewPort = isNative ? 4174 : 4173;

const sharedTests = '**/game.shared.spec.js';
const desktopTests = '**/game.desktop.spec.js';
const mobileTests = '**/game.mobile.spec.js';
const nativeTests = '**/native-game.spec.js';

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 60_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: `http://${previewHost}:${previewPort}`,
        trace: 'on-first-retry'
    },
    webServer: {
        command: isNative
            ? `CAPACITOR=true npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`
            : `npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`,
        url: `http://${previewHost}:${previewPort}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000
    },
    projects: isNative
        ? [
            {name: 'mobile-android', use: {...devices['Pixel 7']}, testMatch: nativeTests},
            {name: 'mobile-ios', use: {...devices['iPhone 13']}, testMatch: nativeTests}
        ]
        : [
            {
                name: 'chromium',
                use: {...devices['Desktop Chrome']},
                testMatch: [sharedTests, desktopTests]
            },
            {
                name: 'mobile-android',
                use: {...devices['Pixel 7']},
                testMatch: [sharedTests, mobileTests]
            },
            {
                name: 'mobile-ios',
                use: {...devices['iPhone 13']},
                testMatch: [sharedTests, mobileTests]
            }
        ]
});
