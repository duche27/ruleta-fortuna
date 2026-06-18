/**
 * Touch helpers for mobile e2e tests.
 * Chromium (Android emulation): CDP input — closer to real browser touch handling.
 * WebKit (iPhone emulation): Playwright dispatchEvent (CDP is Chromium-only).
 */

async function usesCdpTouch(page) {
    return page.context().browser()?.browserType().name() === 'chromium';
}

async function dispatchTouch(client, type, points) {
    await client.send('Input.dispatchTouchEvent', {type, touchPoints: points});
}

export async function getPlayingPanelCenter(page) {
    const panel = page.getByTestId('playing-panel');
    const box = await panel.boundingBox();
    if (!box) throw new Error('playing-panel is not visible');
    return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
        panel
    };
}

async function touchSwipeCdp(page, {deltaX, deltaY, steps, moveOnly}) {
    const {x: startX, y: startY} = await getPlayingPanelCenter(page);
    const client = await page.context().newCDPSession(page);

    await dispatchTouch(client, 'touchStart', [{x: startX, y: startY}]);

    for (let step = 1; step <= steps; step++) {
        const ratio = step / steps;
        await dispatchTouch(client, 'touchMove', [{
            x: startX + deltaX * ratio,
            y: startY + deltaY * ratio
        }]);
    }

    if (!moveOnly) {
        await dispatchTouch(client, 'touchEnd', []);
    }
}

function touchPoint(x, y) {
    return {
        identifier: 1,
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
    };
}

async function touchSwipeDispatch(page, {deltaX, deltaY, steps, moveOnly}) {
    const {x: startX, y: startY, panel} = await getPlayingPanelCenter(page);

    await panel.dispatchEvent('touchstart', {
        touches: [touchPoint(startX, startY)],
        changedTouches: [touchPoint(startX, startY)]
    });

    for (let step = 1; step <= steps; step++) {
        const ratio = step / steps;
        const x = startX + deltaX * ratio;
        const y = startY + deltaY * ratio;
        await page.dispatchEvent('body', 'touchmove', {
            touches: [touchPoint(x, y)],
            changedTouches: [touchPoint(x, y)]
        });
    }

    if (!moveOnly) {
        const endX = startX + deltaX;
        const endY = startY + deltaY;
        await page.dispatchEvent('body', 'touchend', {
            touches: [],
            changedTouches: [touchPoint(endX, endY)]
        });
    }
}

async function runTouchSwipe(page, {deltaX, deltaY, steps = 10, moveOnly = false}) {
    if (await usesCdpTouch(page)) {
        await touchSwipeCdp(page, {deltaX, deltaY, steps, moveOnly});
    } else {
        await touchSwipeDispatch(page, {deltaX, deltaY, steps, moveOnly});
    }
}

export async function touchSwipe(page, {deltaX, deltaY, steps = 10}) {
    await runTouchSwipe(page, {deltaX, deltaY, steps, moveOnly: false});
}

export async function touchSwipeMoveOnly(page, {deltaX, deltaY, steps = 10}) {
    await runTouchSwipe(page, {deltaX, deltaY, steps, moveOnly: true});
}
