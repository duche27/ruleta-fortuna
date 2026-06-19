import {useEffect, useRef} from 'react';
import {detectSwipeDirection, resolveSwipeAction} from '../domain/game-core.js';

const DRAG_START_PX = 10;
const CLICK_SUPPRESS_MS = 400;
const SWIPE_MAX_OFFSET = 96;
const SWIPE_DAMPING = 0.58;
const SWIPE_ROT_FACTOR = 0.085;
const AXIS_LOCK_PX = 12;
const AXIS_DIRECTION_BIAS = 1.2;
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, label, [role="button"]';

export function resolveSwipeAxis(absX, absY) {
    if (absX < AXIS_LOCK_PX && absY < AXIS_LOCK_PX) return null;
    if (absX >= absY * AXIS_DIRECTION_BIAS) return 'horizontal';
    if (absY >= absX * AXIS_DIRECTION_BIAS) return 'vertical';
    return null;
}

function clearSwipeVisuals(layer, surface) {
    if (layer) {
        layer.style.transform = '';
        layer.style.boxShadow = '';
    }
    if (surface) {
        surface.dataset.swipe = '';
        surface.style.setProperty('--swipe-hint-opacity', '0');
    }
}

function releaseSwipeVisuals(layer, surface) {
    if (layer) {
        layer.classList.remove('swipe-surface--grabbing');
        layer.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.3s ease';
        layer.style.transform = '';
        layer.style.boxShadow = '';
    }
    if (surface) {
        surface.dataset.swipe = '';
        surface.style.setProperty('--swipe-hint-opacity', '0');
    }
}

function applySwipeDrag(layer, surface, deltaX, deltaY, axisRef) {
    if (!layer || !surface) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!axisRef.current) {
        axisRef.current = resolveSwipeAxis(absX, absY);
        if (!axisRef.current) return;
    }

    if (axisRef.current === 'vertical') {
        clearSwipeVisuals(layer, surface);
        return;
    }

    const clamped = Math.sign(deltaX) * Math.min(absX, SWIPE_MAX_OFFSET);
    const tx = clamped * SWIPE_DAMPING;
    const rot = clamped * SWIPE_ROT_FACTOR;
    const hintOpacity = Math.min(absX / SWIPE_MAX_OFFSET, 1) * 0.8;

    layer.style.transition = 'none';
    layer.style.transform = `translateX(${tx}px) rotate(${rot}deg) scale(0.97)`;
    layer.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.14)';
    layer.classList.add('swipe-surface--grabbing');

    surface.style.setProperty('--swipe-hint-opacity', String(hintOpacity));
    surface.dataset.swipe = deltaX < 0 ? 'left' : 'right';
}

export function useSwipeGesture({enabled, surfaceRef, dragLayerRef, onAction}) {
    const startRef = useRef(null);
    const pendingRef = useRef(null);
    const axisRef = useRef(null);
    const suppressClicksUntilRef = useRef(0);
    const onActionRef = useRef(onAction);
    useEffect(() => {
        onActionRef.current = onAction;
    }, [onAction]);

    useEffect(() => {
        if (!enabled) return undefined;

        const surface = surfaceRef.current;
        if (!surface) return undefined;

        const getLayer = () => dragLayerRef?.current ?? surface;
        let documentTouchAttached = false;

        const shouldSuppressClick = () =>
            surface.classList.contains('swipe-surface--dragging')
            || performance.now() < suppressClicksUntilRef.current;

        const isInteractiveTarget = (target) =>
            target instanceof Element && target.closest(INTERACTIVE_SELECTOR);

        const armGesture = () => {
            surface.classList.add('swipe-surface--dragging');
            surface.style.touchAction = 'none';
        };

        const disarmGesture = () => {
            releaseSwipeVisuals(getLayer(), surface);
            surface.style.touchAction = '';
            surface.classList.remove('swipe-surface--dragging');
            suppressClicksUntilRef.current = performance.now() + CLICK_SUPPRESS_MS;
            detachDocumentTouch();
        };

        const begin = (x, y, id) => {
            startRef.current = {x, y, id};
            axisRef.current = null;
            const layer = getLayer();
            layer.style.transition = 'none';
            layer.classList.add('swipe-surface--grabbing');
        };

        const move = (x, y) => {
            const start = startRef.current;
            if (!start) return;
            applySwipeDrag(getLayer(), surface, x - start.x, y - start.y, axisRef);
        };

        const finish = (x, y, id) => {
            const start = startRef.current;
            if (!start || start.id !== id) return;

            const deltaX = x - start.x;
            const deltaY = y - start.y;
            startRef.current = null;
            axisRef.current = null;

            const action = resolveSwipeAction(detectSwipeDirection(deltaX, deltaY));
            disarmGesture();
            if (action) onActionRef.current(action);
        };

        const cancel = (id) => {
            if (startRef.current?.id !== id && pendingRef.current?.id !== id) return;
            pendingRef.current = null;
            startRef.current = null;
            axisRef.current = null;
            disarmGesture();
        };

        const tryStartDrag = (x, y, id) => {
            if (!pendingRef.current || pendingRef.current.id !== id || startRef.current) return false;
            const dx = x - pendingRef.current.x;
            const dy = y - pendingRef.current.y;
            if (Math.hypot(dx, dy) < DRAG_START_PX) return false;
            const pending = pendingRef.current;
            pendingRef.current = null;
            begin(pending.x, pending.y, id);
            move(x, y);
            return true;
        };

        const activeTouchId = () => startRef.current?.id ?? pendingRef.current?.id;

        const findTouch = (list) => {
            const id = activeTouchId();
            if (id === undefined) return null;
            return Array.from(list).find((touch) => touch.identifier === id) ?? null;
        };

        const onGestureMove = (x, y, id) => {
            if (pendingRef.current?.id === id) {
                tryStartDrag(x, y, id);
                return;
            }
            if (startRef.current?.id === id) move(x, y);
        };

        const onGestureEnd = (x, y, id) => {
            if (pendingRef.current?.id === id) {
                pendingRef.current = null;
                disarmGesture();
                return;
            }
            if (startRef.current?.id === id) finish(x, y, id);
        };

        const suppressClick = (e) => {
            if (!shouldSuppressClick() || !isInteractiveTarget(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
        };

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            const touch = e.touches[0];
            if (isInteractiveTarget(e.target)) return;
            pendingRef.current = {x: touch.clientX, y: touch.clientY, id: touch.identifier};
            armGesture();
            attachDocumentTouch();
        };

        const onTouchMove = (e) => {
            const touch = findTouch(e.touches);
            if (!touch) return;
            e.preventDefault();
            onGestureMove(touch.clientX, touch.clientY, touch.identifier);
        };

        const onTouchEnd = (e) => {
            const touch = findTouch(e.changedTouches);
            if (!touch) return;
            onGestureEnd(touch.clientX, touch.clientY, touch.identifier);
        };

        const onTouchCancel = (e) => {
            const touch = findTouch(e.changedTouches);
            if (!touch) return;
            cancel(touch.identifier);
        };

        const onPointerDown = (e) => {
            if (e.pointerType === 'touch') return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (isInteractiveTarget(e.target)) return;
            pendingRef.current = {x: e.clientX, y: e.clientY, id: e.pointerId};
            armGesture();
        };

        const onPointerMove = (e) => {
            if (e.pointerType === 'touch') return;
            if (pendingRef.current?.id === e.pointerId && !startRef.current) {
                if (tryStartDrag(e.clientX, e.clientY, e.pointerId)) {
                    try {
                        surface.setPointerCapture(e.pointerId);
                    } catch {
                        /* WebView may reject capture */
                    }
                }
                return;
            }
            onGestureMove(e.clientX, e.clientY, e.pointerId);
        };

        const onPointerUp = (e) => {
            if (e.pointerType === 'touch') return;
            if (surface.hasPointerCapture(e.pointerId)) {
                surface.releasePointerCapture(e.pointerId);
            }
            onGestureEnd(e.clientX, e.clientY, e.pointerId);
        };

        const onPointerCancel = (e) => {
            if (e.pointerType === 'touch') return;
            if (surface.hasPointerCapture(e.pointerId)) {
                surface.releasePointerCapture(e.pointerId);
            }
            cancel(e.pointerId);
        };

        const attachDocumentTouch = () => {
            if (documentTouchAttached) return;
            documentTouchAttached = true;
            document.addEventListener('touchmove', onTouchMove, {passive: false});
            document.addEventListener('touchend', onTouchEnd, {passive: true});
            document.addEventListener('touchcancel', onTouchCancel, {passive: true});
        };

        const detachDocumentTouch = () => {
            if (!documentTouchAttached) return;
            documentTouchAttached = false;
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchCancel);
        };

        surface.addEventListener('touchstart', onTouchStart, {passive: true});
        surface.addEventListener('pointerdown', onPointerDown);
        surface.addEventListener('pointermove', onPointerMove);
        surface.addEventListener('pointerup', onPointerUp);
        surface.addEventListener('pointercancel', onPointerCancel);
        surface.addEventListener('click', suppressClick, true);

        return () => {
            surface.removeEventListener('touchstart', onTouchStart);
            surface.removeEventListener('pointerdown', onPointerDown);
            surface.removeEventListener('pointermove', onPointerMove);
            surface.removeEventListener('pointerup', onPointerUp);
            surface.removeEventListener('pointercancel', onPointerCancel);
            surface.removeEventListener('click', suppressClick, true);
            detachDocumentTouch();
            pendingRef.current = null;
            startRef.current = null;
            axisRef.current = null;
            suppressClicksUntilRef.current = 0;
            disarmGesture();
        };
    }, [enabled, surfaceRef, dragLayerRef]);
}
