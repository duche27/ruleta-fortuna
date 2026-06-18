import {describe, expect, it} from 'vitest';
import {resolveSwipeAxis} from '../../src/infrastructure/swipe-drag-feedback.js';

describe('resolveSwipeAxis', () => {
    it('waits until movement is far enough', () => {
        expect(resolveSwipeAxis(8, 4)).toBeNull();
    });

    it('tolerates slight vertical noise on horizontal drags', () => {
        expect(resolveSwipeAxis(20, 12)).toBe('horizontal');
    });

    it('locks vertical only with a clear upward bias', () => {
        expect(resolveSwipeAxis(10, 24)).toBe('vertical');
    });

    it('stays undecided on ambiguous diagonals', () => {
        expect(resolveSwipeAxis(14, 12)).toBeNull();
    });
});
