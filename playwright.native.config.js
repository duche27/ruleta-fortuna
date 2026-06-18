import {defineConfig, devices} from '@playwright/test';

const previewHost = '127.0.0.1';
const previewPort = 4174;

export default defineConfig({
    testDir: 'tests/e2e',
    testMatch: 'native-game.spec.js',
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
        command: `CAPACITOR=true npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`,
        url: `http://${previewHost}:${previewPort}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000
    },
    projects: [
        {name: 'mobile-android', use: {...devices['Pixel 7']}},
        {name: 'mobile-ios', use: {...devices['iPhone 13']}}
    ]
});
