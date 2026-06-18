import {expect} from '@playwright/test';

export async function startTestGame(page, {assertTitle = true} = {}) {
    await page.goto('/?profile=test');
    if (assertTitle) {
        await expect(page.getByTestId('game-title')).toHaveText('Ruleta Test');
    }
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('playing-panel')).toBeVisible();
}
