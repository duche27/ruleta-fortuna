import {test, expect} from '@playwright/test';
import {startTestGame} from './helpers.js';

test.describe('Ruleta game', () => {
    test('loads profile from url and shows setup screen', async ({page}) => {
        await page.goto('/?profile=test');
        await expect(page.getByTestId('game-title')).toHaveText('Ruleta Test');
        await expect(page.getByTestId('start-button')).toBeVisible();
        await expect(page.locator('#loading-screen')).toHaveCount(0);
    });

    test('starts game and tracks correct answers', async ({page}) => {
        await startTestGame(page);
        await page.getByTestId('correct-button').click();
        await expect(page.getByTestId('correct-count')).toHaveText('1');
    });

    test('shows jump scare on incorrect answer', async ({page}) => {
        await startTestGame(page);
        await page.getByTestId('incorrect-button').click();
        await expect(page.getByTestId('jump-scare')).toBeVisible();
    });

    test('passes to next letter', async ({page}) => {
        await startTestGame(page);
        await expect(page.getByText('Capital de España')).toBeVisible();
        await page.getByTestId('pass-button').click();
        await expect(page.getByText('Animal que ladra')).toBeVisible();
    });

    test('completes multi-question letter before advancing', async ({page}) => {
        await startTestGame(page);
        await page.getByTestId('pass-button').click();
        await page.getByTestId('correct-button').click();
        await expect(page.getByText('Fruta amarilla')).toBeVisible();
        await page.getByTestId('correct-button').click();
        await expect(page.getByText('Planeta rojo')).toBeVisible();
    });

    test('finishes game after all letters are completed', async ({page}) => {
        await startTestGame(page);
        await page.getByTestId('correct-button').click();
        await page.getByTestId('correct-button').click();
        await page.getByTestId('correct-button').click();
        await page.getByTestId('correct-button').click();
        await expect(page.getByTestId('finished-panel')).toBeVisible();
        await expect(page.getByText('¡Juego Terminado!')).toBeVisible();
    });

    test('mute button toggles without breaking gameplay', async ({page}) => {
        await startTestGame(page);
        await page.getByTestId('mute-button').click();
        await page.getByTestId('correct-button').click();
        await expect(page.getByTestId('correct-count')).toHaveText('1');
    });

    test('manifest and pwa assets are served', async ({request}) => {
        const manifest = await request.get('/app.webmanifest');
        expect(manifest.ok()).toBeTruthy();
        const body = await manifest.json();
        expect(body.display).toBe('standalone');

        const assetManifest = await request.get('/assets/images/arribas/random/manifest.json');
        expect(assetManifest.ok()).toBeTruthy();
        const files = await assetManifest.json();
        expect(Array.isArray(files.files)).toBeTruthy();
    });
});
