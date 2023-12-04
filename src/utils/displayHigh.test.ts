import { describe, test, expect } from 'vitest';
import { displayHigh } from './displayHigh';

describe('fn: displayHigh', () => {
    test('keep low numbers the same', () => {
        const test = 123451;
        const data = 123451;
        const assert = displayHigh(data);
        expect(`${test}`).toBe(assert);
    });

    test('the 100th 1000nd converts to e notation and rounds down', () => {
        const test = '1.23e+6';
        const data = 1234560;
        const assert = displayHigh(data);
        expect(`${test}`).toBe(assert);
    });

    test('the 100th 1000nd converts to e notation and rounds up', () => {
        const test = '1.25e+6';
        const data = 1254560;
        const assert = displayHigh(data);
        expect(`${test}`).toBe(assert);
    });
});
