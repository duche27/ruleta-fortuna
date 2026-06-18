import {test, expect} from '@playwright/test';
import {startTestGame} from './helpers.js';
import {touchSwipe, touchSwipeMoveOnly} from './swipe-helpers.js';

test.describe('Ruleta game (mobile)', () => {
    test('swipe left marks answer as correct', async ({page}) => {
        await startTestGame(page);
        await touchSwipe(page, {deltaX: -180, deltaY: 0});
        await expect(page.getByTestId('correct-count')).toHaveText('1');
    });

    test('swipe right shows jump scare', async ({page}) => {
        await startTestGame(page);
        await touchSwipe(page, {deltaX: 180, deltaY: 0});
        await expect(page.getByTestId('jump-scare')).toBeVisible();
    });

    test('swipe up passes to next letter', async ({page}) => {
        await startTestGame(page);
        await expect(page.getByText('Capital de España')).toBeVisible();
        await touchSwipe(page, {deltaX: 0, deltaY: -180});
        await expect(page.getByText('Animal que ladra')).toBeVisible();
    });

    test('does not answer before touch release', async ({page}) => {
        await startTestGame(page);
        await touchSwipeMoveOnly(page, {deltaX: 180, deltaY: 0});
        await expect(page.getByTestId('jump-scare')).not.toBeVisible();
        await expect(page.getByTestId('correct-count')).toHaveText('0');
    });
});
