import { describe, test, expect, vi } from 'vitest';
import { IncomeType } from './IncomeType';
import type { IconComponent } from './IncomeType';

const mockIcon = vi.fn() as unknown as IconComponent;

function createIncome(overrides = {}): IncomeType {
    return new IncomeType({
        name: 'Test Job',
        cost: 100,
        income: 10,
        countdown: 5000,
        icon: mockIcon,
        ...overrides,
    });
}

describe('class: IncomeType', () => {
    describe('constructor', () => {
        test('sets required properties', () => {
            const income = createIncome();
            expect(income.name).toBe('Test Job');
            expect(income.cost).toBe(100);
            expect(income.income).toBe(10);
            expect(income.countdown).toBe(5000);
        });

        test('sets default optional properties', () => {
            const income = createIncome();
            expect(income.inventory).toBe(0);
            expect(income.timeMultiplier).toBe(1);
            expect(income.incomeMultiplier).toBe(1);
            expect(income.unlockIncome).toBe(0);
        });

        test('overrides optional properties', () => {
            const income = createIncome({
                inventory: 5,
                timeMultiplier: 2,
                incomeMultiplier: 1.5,
                unlockIncome: 1000,
            });
            expect(income.inventory).toBe(5);
            expect(income.timeMultiplier).toBe(2);
            expect(income.incomeMultiplier).toBe(1.5);
            expect(income.unlockIncome).toBe(1000);
        });
    });

    describe('getIcon()', () => {
        test('returns icon component', () => {
            const income = createIncome();
            expect(income.getIcon()).toBe(mockIcon);
        });
    });

    describe('isUnlocked()', () => {
        test('unlocked when value >= unlockIncome', () => {
            const income = createIncome({ unlockIncome: 100 });
            expect(income.isUnlocked(100)).toBe(true);
            expect(income.isUnlocked(150)).toBe(true);
        });

        test('locked when value < unlockIncome', () => {
            const income = createIncome({ unlockIncome: 100 });
            expect(income.isUnlocked(50)).toBe(false);
            expect(income.isUnlocked(99)).toBe(false);
        });

        test('always unlocked when unlockIncome is 0', () => {
            const income = createIncome({ unlockIncome: 0 });
            expect(income.isUnlocked(0)).toBe(true);
        });
    });

    describe('addInventory()', () => {
        test('increases inventory count', () => {
            const income = createIncome();
            income.addInventory(1);
            expect(income.inventory).toBe(1);
            income.addInventory(5);
            expect(income.inventory).toBe(6);
        });

        test('applies level multiplier at threshold 10', () => {
            const income = createIncome();
            income.addInventory(10);
            expect(income.timeMultiplier).toBe(1.1);
            expect(income.incomeMultiplier).toBe(1.1);
        });

        test('applies level multiplier at threshold 25', () => {
            const income = createIncome();
            income.addInventory(25);
            expect(income.timeMultiplier).toBe(1.25);
            expect(income.incomeMultiplier).toBe(1.25);
        });

        test('applies level multiplier at threshold 100', () => {
            const income = createIncome();
            income.addInventory(100);
            expect(income.timeMultiplier).toBe(2);
            expect(income.incomeMultiplier).toBe(2);
        });

        test('applies level multiplier at threshold 1000', () => {
            const income = createIncome();
            income.addInventory(1000);
            expect(income.timeMultiplier).toBe(4);
            expect(income.incomeMultiplier).toBe(4);
        });
    });

    describe('getValue()', () => {
        test('returns income * incomeMultiplier', () => {
            const income = createIncome({ income: 10, incomeMultiplier: 2 });
            expect(income.getValue().real()).toBe(20);
        });

        test('returns NumberUnit', () => {
            const income = createIncome({ income: 1000000 });
            expect(income.getValue().display()).toBe('1M');
        });
    });

    describe('getInventory()', () => {
        test('returns current inventory', () => {
            const income = createIncome({ inventory: 5 });
            expect(income.getInventory()).toBe(5);
        });
    });

    describe('getCost()', () => {
        test('returns cost', () => {
            const income = createIncome({ cost: 500 });
            expect(income.getCost()).toBe(500);
        });
    });

    describe('getCountdown()', () => {
        test('returns countdown / timeMultiplier', () => {
            const income = createIncome({
                countdown: 10000,
                timeMultiplier: 2,
            });
            expect(income.getCountdown()).toBe(5000);
        });

        test('minimum countdown is 1000ms', () => {
            const income = createIncome({ countdown: 500, timeMultiplier: 1 });
            expect(income.getCountdown()).toBe(1000);
        });

        test('minimum applies with high multiplier', () => {
            const income = createIncome({
                countdown: 10000,
                timeMultiplier: 100,
            });
            expect(income.getCountdown()).toBe(1000);
        });
    });

    describe('isFastCountdown()', () => {
        test('true when countdown <= 1000ms', () => {
            const income = createIncome({ countdown: 1000, timeMultiplier: 1 });
            expect(income.isFastCountdown()).toBe(true);
        });

        test('false when countdown > 1000ms', () => {
            const income = createIncome({ countdown: 5000, timeMultiplier: 1 });
            expect(income.isFastCountdown()).toBe(false);
        });
    });

    describe('getCountdownSec()', () => {
        test('returns seconds with 2 decimals', () => {
            const income = createIncome({ countdown: 5000, timeMultiplier: 1 });
            expect(income.getCountdownSec()).toBe('5.00');
        });

        test('handles sub-second', () => {
            const income = createIncome({ countdown: 1500, timeMultiplier: 1 });
            expect(income.getCountdownSec()).toBe('1.50');
        });
    });

    describe('getIncome()', () => {
        test('returns inventory * income * incomeMultiplier', () => {
            const income = createIncome({
                inventory: 5,
                income: 10,
                incomeMultiplier: 2,
            });
            expect(income.getIncome().real()).toBe(100);
        });

        test('returns 0 when no inventory', () => {
            const income = createIncome({ inventory: 0, income: 100 });
            expect(income.getIncome().real()).toBe(0);
        });
    });

    describe('hasInventory()', () => {
        test('true when inventory > 0', () => {
            const income = createIncome({ inventory: 1 });
            expect(income.hasInventory()).toBe(true);
        });

        test('false when inventory is 0', () => {
            const income = createIncome({ inventory: 0 });
            expect(income.hasInventory()).toBe(false);
        });
    });
});
