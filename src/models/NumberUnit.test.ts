import { describe, test, expect } from 'vitest';
import { NumberUnit } from './NumberUnit';

describe('class: NumberUnit', () => {
    describe('constructor', () => {
        test('initializes with number', () => {
            const unit = new NumberUnit(100);
            expect(unit.number).toBe(100);
        });

        test('initializes with 0', () => {
            const unit = new NumberUnit(0);
            expect(unit.number).toBe(0);
        });

        test('initializes with negative', () => {
            const unit = new NumberUnit(-50);
            expect(unit.number).toBe(-50);
        });

        test('initializes with decimal', () => {
            const unit = new NumberUnit(123.456);
            expect(unit.number).toBe(123.456);
        });
    });

    describe('real()', () => {
        test('returns raw number', () => {
            const unit = new NumberUnit(1234567);
            expect(unit.real()).toBe(1234567);
        });

        test('returns 0', () => {
            const unit = new NumberUnit(0);
            expect(unit.real()).toBe(0);
        });
    });

    describe('display()', () => {
        test('formats small numbers', () => {
            const unit = new NumberUnit(1234);
            expect(unit.display()).toBe('1234');
        });

        test('formats large numbers with suffix', () => {
            const unit = new NumberUnit(1234567);
            expect(unit.display()).toBe('1.23M');
        });

        test('formats 0', () => {
            const unit = new NumberUnit(0);
            expect(unit.display()).toBe('0');
        });
    });

    describe('add()', () => {
        test('adds positive number', () => {
            const unit = new NumberUnit(100);
            unit.add(50);
            expect(unit.number).toBe(150);
        });

        test('adds negative number', () => {
            const unit = new NumberUnit(100);
            unit.add(-30);
            expect(unit.number).toBe(70);
        });

        test('adds to 0', () => {
            const unit = new NumberUnit(0);
            unit.add(100);
            expect(unit.number).toBe(100);
        });

        test('adds decimal', () => {
            const unit = new NumberUnit(10);
            unit.add(0.5);
            expect(unit.number).toBe(10.5);
        });
    });

    describe('subtract()', () => {
        test('subtracts positive number', () => {
            const unit = new NumberUnit(100);
            unit.subtract(30);
            expect(unit.number).toBe(70);
        });

        test('subtracts to negative', () => {
            const unit = new NumberUnit(50);
            unit.subtract(100);
            expect(unit.number).toBe(-50);
        });

        test('subtracts negative (adds)', () => {
            const unit = new NumberUnit(100);
            unit.subtract(-50);
            expect(unit.number).toBe(150);
        });

        test('subtracts decimal', () => {
            const unit = new NumberUnit(10);
            unit.subtract(0.5);
            expect(unit.number).toBe(9.5);
        });
    });
});
