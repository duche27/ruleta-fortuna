import {describe, it, expect} from 'vitest';
import GameCore from '../../src/domain/game-core.js';

const {
    isSupportedImageFile,
    isSupportedAudioFile,
    buildAssetUrl,
    manifestFilesToUrls,
    computeStats,
    getNextIndex,
    getRandomPhotoIndex,
    detectSwipeDirection,
    resolveSwipeAction,
    getLetterFillColor,
    getAnswerSummary,
    createInitialProgress,
    applyAnswer,
    applyPass
} = GameCore;

const sampleQuestions = [
    {letter: 'A', questions: [{question: 'q1', answer: 'a1'}]},
    {letter: 'B', questions: [{question: 'q2', answer: 'a2'}, {question: 'q3', answer: 'a3'}]},
    {letter: 'C', questions: [{question: 'q4', answer: 'a4'}]}
];

describe('asset helpers', () => {
    it('detects supported image extensions', () => {
        expect(isSupportedImageFile('photo.jpeg')).toBe(true);
        expect(isSupportedImageFile('photo.JPG')).toBe(true);
        expect(isSupportedImageFile('notes.txt')).toBe(false);
    });

    it('detects supported audio extensions', () => {
        expect(isSupportedAudioFile('sound.mp3')).toBe(true);
        expect(isSupportedAudioFile('clip.m4a')).toBe(true);
        expect(isSupportedAudioFile('image.png')).toBe(false);
    });

    it('builds encoded asset urls', () => {
        expect(buildAssetUrl('assets/images/a/', 'my pic.png'))
            .toBe('assets/images/a/my%20pic.png');
    });

    it('converts manifest data to urls', () => {
        const urls = manifestFilesToUrls(
            {files: ['a.png', 'b.txt', 'c.webp']},
            'assets/images/x/random/',
            isSupportedImageFile
        );
        expect(urls).toEqual([
            'assets/images/x/random/a.png',
            'assets/images/x/random/c.webp'
        ]);
    });
});

describe('game stats', () => {
    it('computes correct, incorrect and remaining counts', () => {
        const progress = [
            {answers: [true, false]},
            {answers: [true]},
            {answers: []}
        ];
        expect(computeStats(progress, sampleQuestions)).toEqual({
            correct: 2,
            incorrect: 1,
            remaining: 1
        });
    });
});

describe('navigation', () => {
    it('skips completed letters when finding next index', () => {
        const progress = [
            {status: 'completed'},
            {status: 'completed'},
            {status: 'unanswered'}
        ];
        expect(getNextIndex(0, progress, 3)).toBe(2);
    });

    it('returns -1 when all letters are completed', () => {
        const progress = [
            {status: 'completed'},
            {status: 'completed'},
            {status: 'completed'}
        ];
        expect(getNextIndex(2, progress, 3)).toBe(-1);
    });
});

describe('photos', () => {
    it('returns -1 when there are no images', () => {
        expect(getRandomPhotoIndex(0)).toBe(-1);
    });

    it('never returns the excluded index when multiple images exist', () => {
        for (let i = 0; i < 20; i++) {
            const idx = getRandomPhotoIndex(5, 2);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).not.toBe(2);
        }
    });
});

describe('swipe detection', () => {
    it('maps horizontal swipes to left and right', () => {
        expect(detectSwipeDirection(80, 10)).toBe('right');
        expect(detectSwipeDirection(-80, 10)).toBe('left');
    });

    it('maps upward swipe to pass action', () => {
        expect(detectSwipeDirection(10, -80)).toBe('up');
    });

    it('ignores small movements', () => {
        expect(detectSwipeDirection(10, 5)).toBeNull();
    });

    it('maps swipe directions to game actions', () => {
        expect(resolveSwipeAction('left')).toBe('correct');
        expect(resolveSwipeAction('right')).toBe('incorrect');
        expect(resolveSwipeAction('up')).toBe('pass');
        expect(resolveSwipeAction(null)).toBeNull();
    });
});

describe('letter visuals', () => {
    it('highlights current letter while playing', () => {
        const colors = getLetterFillColor({
            index: 1,
            currentIndex: 1,
            gameState: 'playing',
            prog: {status: 'unanswered', answers: []}
        });
        expect(colors.fill).toBe('#eab308');
    });

    it('summarizes mixed answers on completed letters', () => {
        expect(getAnswerSummary({
            status: 'completed',
            answers: [true, false, true]
        })).toEqual({correct: 2, incorrect: 1});
    });
});

describe('game actions', () => {
    it('creates initial progress for every letter', () => {
        const progress = createInitialProgress(sampleQuestions);
        expect(progress).toHaveLength(3);
        expect(progress[0]).toEqual({status: 'unanswered', answers: [], currentQ: 0});
    });

    it('advances to next letter after completing all questions', () => {
        const progress = createInitialProgress(sampleQuestions);
        const result = applyAnswer(progress, sampleQuestions, 0, true);
        expect(result.currentIndex).toBe(1);
        expect(result.progress[0].status).toBe('completed');
    });

    it('stays on same letter when it has more questions', () => {
        const progress = createInitialProgress(sampleQuestions);
        const afterFirst = applyAnswer(progress, sampleQuestions, 1, true);
        expect(afterFirst.currentIndex).toBe(1);
        expect(afterFirst.progress[1].currentQ).toBe(1);
    });

    it('finishes game after last letter is completed', () => {
        let progress = createInitialProgress(sampleQuestions);
        ({progress} = applyAnswer(progress, sampleQuestions, 0, true));
        ({progress} = applyAnswer(progress, sampleQuestions, 1, true));
        ({progress} = applyAnswer(progress, sampleQuestions, 1, false));
        const final = applyAnswer(progress, sampleQuestions, 2, true);
        expect(final.gameState).toBe('finished');
    });

    it('pass moves to next unanswered letter', () => {
        const progress = createInitialProgress(sampleQuestions);
        const result = applyPass(progress, sampleQuestions, 0);
        expect(result.currentIndex).toBe(1);
        expect(result.progress[0].status).toBe('passed');
    });
});
