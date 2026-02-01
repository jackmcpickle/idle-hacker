import { describe, test, expect } from 'vitest';
import { levelMultiplier } from './levels';

describe('levelMultiplier', () => {
    test('is sorted by qty descending', () => {
        for (let i = 1; i < levelMultiplier.length; i += 1) {
            expect(levelMultiplier[i - 1].qty).toBeGreaterThan(
                levelMultiplier[i].qty,
            );
        }
    });

    test('all entries have required properties', () => {
        for (const level of levelMultiplier) {
            expect(level).toHaveProperty('qty');
            expect(level).toHaveProperty('speed');
            expect(level).toHaveProperty('income');
            expect(typeof level.qty).toBe('number');
            expect(typeof level.speed).toBe('number');
            expect(typeof level.income).toBe('number');
        }
    });

    test('speed multipliers >= 1', () => {
        for (const level of levelMultiplier) {
            expect(level.speed).toBeGreaterThanOrEqual(1);
        }
    });

    test('income multipliers >= 1', () => {
        for (const level of levelMultiplier) {
            expect(level.income).toBeGreaterThanOrEqual(1);
        }
    });

    test('qty values > 0', () => {
        for (const level of levelMultiplier) {
            expect(level.qty).toBeGreaterThan(0);
        }
    });

    test('contains expected thresholds', () => {
        const quantities = levelMultiplier.map((l) => l.qty);
        expect(quantities).toContain(25);
        expect(quantities).toContain(50);
        expect(quantities).toContain(100);
        expect(quantities).toContain(500);
        expect(quantities).toContain(1000);
    });

    test('higher qty has higher multipliers', () => {
        for (let i = 1; i < levelMultiplier.length; i += 1) {
            expect(levelMultiplier[i - 1].speed).toBeGreaterThanOrEqual(
                levelMultiplier[i].speed,
            );
            expect(levelMultiplier[i - 1].income).toBeGreaterThanOrEqual(
                levelMultiplier[i].income,
            );
        }
    });
});
