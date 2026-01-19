import { describe, test, expect } from 'vitest';
import { displayHigh } from './displayHigh';

describe('fn: displayHigh', () => {
    describe('below 100K', () => {
        test('0 → "0"', () => {
            expect(displayHigh(0)).toBe('0');
        });

        test('1234 → "1234"', () => {
            expect(displayHigh(1234)).toBe('1234');
        });

        test('99999 → "99999"', () => {
            expect(displayHigh(99999)).toBe('99999');
        });

        test('123.456 → "123.46"', () => {
            expect(displayHigh(123.456)).toBe('123.46');
        });

        test('0.1 → "0.10"', () => {
            expect(displayHigh(0.1)).toBe('0.10');
        });
    });

    describe('compact notation (100K to 10Qa)', () => {
        test('100000 → "100K"', () => {
            expect(displayHigh(100000)).toBe('100K');
        });

        test('150000 → "150K"', () => {
            expect(displayHigh(150000)).toBe('150K');
        });

        test('1234567 → "1.23M"', () => {
            expect(displayHigh(1234567)).toBe('1.23M');
        });

        test('1000000000 → "1B"', () => {
            expect(displayHigh(1000000000)).toBe('1B');
        });

        test('2500000000000 → "2.5T"', () => {
            expect(displayHigh(2500000000000)).toBe('2.5T');
        });

        test('1000000000000000 → "1Qa"', () => {
            expect(displayHigh(1000000000000000)).toBe('1Qa');
        });

        test('9.99e15 → "9.99Qa"', () => {
            expect(displayHigh(9.99e15)).toBe('9.99Qa');
        });
    });

    describe('scientific (10^16+)', () => {
        test('1e16 → "1.00e+16"', () => {
            expect(displayHigh(1e16)).toBe('1.00e+16');
        });

        test('1e20 → "1.00e+20"', () => {
            expect(displayHigh(1e20)).toBe('1.00e+20');
        });

        test('1.5e18 → "1.50e+18"', () => {
            expect(displayHigh(1.5e18)).toBe('1.50e+18');
        });
    });

    describe('edge cases', () => {
        test('negative → "-1.23M"', () => {
            expect(displayHigh(-1234567)).toBe('-1.23M');
        });

        test('negative small → "-123"', () => {
            expect(displayHigh(-123)).toBe('-123');
        });

        test('Infinity → "Infinity"', () => {
            expect(displayHigh(Infinity)).toBe('Infinity');
        });

        test('-Infinity → "-Infinity"', () => {
            expect(displayHigh(-Infinity)).toBe('-Infinity');
        });

        test('NaN → "NaN"', () => {
            expect(displayHigh(NaN)).toBe('NaN');
        });
    });
});
