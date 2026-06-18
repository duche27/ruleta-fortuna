import {test, expect} from '@playwright/test';
import {startTestGame} from './helpers.js';

test.describe('Ruleta game (desktop)', () => {
    test('keyboard shortcuts work', async ({page}) => {
        await startTestGame(page);
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('correct-count')).toHaveText('1');
        await page.keyboard.press('Backspace');
        await expect(page.getByTestId('jump-scare')).toBeVisible();
    });
});
