const SWIPE_MAX_OFFSET = 96;
const SWIPE_DAMPING = 0.58;
const SWIPE_ROT_FACTOR = 0.085;
const AXIS_LOCK_PX = 12;
const AXIS_DIRECTION_BIAS = 1.2;

export function resolveSwipeAxis(absX, absY) {
    if (absX < AXIS_LOCK_PX && absY < AXIS_LOCK_PX) return null;
    if (absX >= absY * AXIS_DIRECTION_BIAS) return 'horizontal';
    if (absY >= absX * AXIS_DIRECTION_BIAS) return 'vertical';
    return null;
}

export function applySwipeDrag(layer, surface, deltaX, deltaY, axisRef) {
    if (!layer || !surface) return null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!axisRef.current) {
        axisRef.current = resolveSwipeAxis(absX, absY);
        if (!axisRef.current) return null;
    }

    if (axisRef.current === 'vertical') {
        clearSwipeDrag(layer, surface);
        return null;
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

    return surface.dataset.swipe;
}

export function clearSwipeDrag(layer, surface) {
    if (layer) {
        layer.style.transform = '';
        layer.style.boxShadow = '';
    }
    if (surface) {
        surface.dataset.swipe = '';
        surface.style.setProperty('--swipe-hint-opacity', '0');
    }
}

export function releaseSwipeDrag(layer, surface) {
    if (layer) {
        layer.classList.remove('swipe-surface--grabbing');
        layer.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.3s ease';
        layer.style.transform = '';
        layer.style.boxShadow = '';
    }
    if (surface) {
        surface.dataset.swipe = '';
        surface.classList.remove('swipe-surface--dragging');
        surface.style.setProperty('--swipe-hint-opacity', '0');
    }
}
