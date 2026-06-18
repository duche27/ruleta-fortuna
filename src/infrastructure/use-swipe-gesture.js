import {useEffect, useRef} from 'react';
import {detectSwipeDirection, resolveSwipeAction} from '../domain/game-core.js';
import {applySwipeDrag, releaseSwipeDrag} from './swipe-drag-feedback.js';

const DRAG_START_PX = 10;
const CLICK_SUPPRESS_MS = 400;
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, label, [role="button"]';

export function useSwipeGesture({enabled, surfaceRef, dragLayerRef, onAction}) {
    const startRef = useRef(null);
    const pendingRef = useRef(null);
    const axisRef = useRef(null);
    const suppressClicksUntilRef = useRef(0);
    const onActionRef = useRef(onAction);
    onActionRef.current = onAction;

    useEffect(() => {
        if (!enabled) return undefined;

        const surface = surfaceRef.current;
        if (!surface) return undefined;

        const getLayer = () => dragLayerRef?.current ?? surface;

        const shouldSuppressClick = () =>
            surface.classList.contains('swipe-surface--dragging')
            || performance.now() < suppressClicksUntilRef.current;

        const armGesture = () => {
            surface.classList.add('swipe-surface--dragging');
            surface.style.touchAction = 'none';
        };

        const disarmGesture = () => {
            releaseSwipeDrag(getLayer(), surface);
            surface.style.touchAction = '';
            surface.classList.remove('swipe-surface--dragging');
            suppressClicksUntilRef.current = performance.now() + CLICK_SUPPRESS_MS;
            detachDocumentTouch();
        };

        const begin = (x, y, id) => {
            startRef.current = {x, y, id};
            axisRef.current = null;
            const layer = getLayer();
            armGesture();
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

        const activeTouchId = () => startRef.current?.id ?? pendingRef.current?.id;

        const findTouch = (list) => {
            const id = activeTouchId();
            if (id === undefined) return null;
            return Array.from(list).find((touch) => touch.identifier === id) ?? null;
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

        const isInteractiveTarget = (target) => target instanceof Element && target.closest(INTERACTIVE_SELECTOR);

        const suppressClick = (e) => {
            if (!shouldSuppressClick()) return;
            if (!isInteractiveTarget(e.target)) return;
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
            if (pendingRef.current?.id === touch.identifier) {
                tryStartDrag(touch.clientX, touch.clientY, touch.identifier);
                return;
            }
            if (startRef.current?.id === touch.identifier) {
                move(touch.clientX, touch.clientY);
            }
        };

        const onTouchEnd = (e) => {
            const touch = findTouch(e.changedTouches);
            if (!touch) return;
            if (pendingRef.current?.id === touch.identifier) {
                pendingRef.current = null;
                disarmGesture();
                return;
            }
            if (startRef.current?.id === touch.identifier) {
                finish(touch.clientX, touch.clientY, touch.identifier);
            }
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
                if (!tryStartDrag(e.clientX, e.clientY, e.pointerId)) return;
                try {
                    surface.setPointerCapture(e.pointerId);
                } catch {
                    /* Android WebView may reject capture */
                }
                return;
            }
            if (!startRef.current || startRef.current.id !== e.pointerId) return;
            move(e.clientX, e.clientY);
        };

        const onPointerUp = (e) => {
            if (e.pointerType === 'touch') return;
            if (pendingRef.current?.id === e.pointerId) {
                pendingRef.current = null;
                disarmGesture();
                return;
            }
            if (!startRef.current || startRef.current.id !== e.pointerId) return;
            if (surface.hasPointerCapture(e.pointerId)) {
                surface.releasePointerCapture(e.pointerId);
            }
            finish(e.clientX, e.clientY, e.pointerId);
        };

        const onPointerCancel = (e) => {
            if (e.pointerType === 'touch') return;
            if (surface.hasPointerCapture(e.pointerId)) {
                surface.releasePointerCapture(e.pointerId);
            }
            cancel(e.pointerId);
        };

        let documentTouchAttached = false;

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
            surface.style.touchAction = '';
            surface.classList.remove('swipe-surface--dragging');
            releaseSwipeDrag(getLayer(), surface);
        };
    }, [enabled, surfaceRef, dragLayerRef]);
}
