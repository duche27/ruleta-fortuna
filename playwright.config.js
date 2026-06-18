import {defineConfig, devices} from '@playwright/test';

const isNative = process.env.PLAYWRIGHT_NATIVE === 'true';
const previewHost = '127.0.0.1';
const previewPort = isNative ? 4174 : 4173;

export default defineConfig({
    testDir: 'tests/e2e',
    testIgnore: isNative ? undefined : '**/native-game.spec.js',
    testMatch: isNative ? 'native-game.spec.js' : undefined,
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
            {name: 'mobile-android', use: {...devices['Pixel 7']}},
            {name: 'mobile-ios', use: {...devices['iPhone 13']}}
        ]
        : [
            {name: 'chromium', use: {...devices['Desktop Chrome']}},
            {name: 'mobile-android', use: {...devices['Pixel 7']}},
            {name: 'mobile-ios', use: {...devices['iPhone 13']}}
        ]
});
