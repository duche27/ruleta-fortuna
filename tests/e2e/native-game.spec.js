import {test, expect} from '@playwright/test';
import {isMobileProject, touchSwipe} from './swipe-helpers.js';

async function startTestGame(page) {
    await page.goto('/?profile=test');
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('playing-panel')).toBeVisible();
}

test.describe('Native shell', () => {
    test('uses compact layout in Capacitor build', async ({page}) => {
        await startTestGame(page);
        await expect(page.locator('.native-play-shell')).toBeVisible();
        await expect(page.getByTestId('game-title')).toHaveCount(0);
    });

    test('swipe left marks answer as correct on mobile', async ({page}, testInfo) => {
        test.skip(!isMobileProject(testInfo), 'Mobile-only swipe test');
        await startTestGame(page);
        await touchSwipe(page, {deltaX: -180, deltaY: 0});
        await expect(page.getByTestId('correct-count')).toHaveText('1');
    });
});
