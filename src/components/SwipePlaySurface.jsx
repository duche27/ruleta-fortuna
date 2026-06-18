import {useRef} from 'react';
import {useSwipeGesture} from '../infrastructure/swipe-gesture.js';

export function SwipePlaySurface({className = '', enabled, onSwipe, children}) {
    const surfaceRef = useRef(null);
    const dragLayerRef = useRef(null);

    useSwipeGesture({enabled, surfaceRef, dragLayerRef, onAction: onSwipe});

    return (
        <div ref={surfaceRef} className={`swipe-surface relative ${className}`} data-testid="playing-panel">
            <div className="swipe-hint swipe-hint--correct" aria-hidden="true"/>
            <div className="swipe-hint swipe-hint--incorrect" aria-hidden="true"/>
            <div ref={dragLayerRef} className="swipe-drag-layer flex flex-col flex-1 min-h-0 w-full">
                {children}
            </div>
        </div>
    );
}
