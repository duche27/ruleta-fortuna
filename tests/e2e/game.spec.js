import {test, expect} from '@playwright/test';

async function startTestGame(page) {
    await page.goto('/?profile=test');
    await expect(page.getByTestId('game-title')).toHaveText('Ruleta Test');
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('playing-panel')).toBeVisible();
}

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

    test('keyboard shortcuts work on desktop', async ({page}) => {
        await startTestGame(page);
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('correct-count')).toHaveText('1');
        await page.keyboard.press('Backspace');
        await expect(page.getByTestId('jump-scare')).toBeVisible();
    });

    test('swipe left marks answer as correct on mobile', async ({page}, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', 'Mobile-only swipe test');
        await startTestGame(page);
        await page.evaluate(() => {
            const panel = document.querySelector('[data-testid="playing-panel"]');
            const rect = panel.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            const endX = startX - 180;
            const mkTouch = (x, y) => new Touch({
                identifier: 1,
                target: panel,
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
                screenX: x,
                screenY: y,
                radiusX: 1,
                radiusY: 1,
                rotationAngle: 0,
                force: 1
            });
            panel.dispatchEvent(new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [mkTouch(startX, startY)],
                changedTouches: [mkTouch(startX, startY)],
                targetTouches: [mkTouch(startX, startY)]
            }));
            document.dispatchEvent(new TouchEvent('touchmove', {
                bubbles: true,
                cancelable: true,
                touches: [mkTouch(endX, startY)],
                changedTouches: [mkTouch(endX, startY)],
                targetTouches: [mkTouch(endX, startY)]
            }));
            document.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true,
                touches: [],
                changedTouches: [mkTouch(endX, startY)],
                targetTouches: []
            }));
        });
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
