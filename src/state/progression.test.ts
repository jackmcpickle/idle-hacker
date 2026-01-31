import { describe, it, expect, beforeEach } from 'vitest';
import type { GameContext } from '.';
import { IncomeType } from '@/models/IncomeType';
import { createFreshState } from './testHelpers';

describe('Progression Milestones', () => {
    let state: GameContext;

    beforeEach(() => {
        state = createFreshState();
    });

    it('unlocks Freelance Tasks at 1000 total earned', () => {
        const freelance = state.incomeTypes.find(
            (i) => i.name === 'Freelance Tasks',
        );
        expect(freelance?.unlockIncome).toBe(1_000);
    });

    it('unlocks Bug Bounties at 10000000 total earned', () => {
        const bugBounties = state.incomeTypes.find(
            (i) => i.name === 'Bug Bounties',
        );
        expect(bugBounties?.unlockIncome).toBe(10_000_000);
    });

    it('unlocks SaaS Platform at 1 quadrillion total earned', () => {
        const saas = state.incomeTypes.find((i) => i.name === 'SaaS Platform');
        expect(saas?.unlockIncome).toBe(1_000_000_000_000_000);
    });

    it('level multipliers scale correctly', () => {
        // Test multiplier thresholds
        const incomeType = new IncomeType({
            name: 'Test',
            cost: 10,
            income: 10,
            countdown: 1000,
            inventory: 0,
            unlockIncome: 0,
        });

        // Add 10 items - should get 1.1x
        incomeType.addInventory(10);
        expect(incomeType.incomeMultiplier).toBe(1.1);

        // Add to 25 items - should get 1.25x
        incomeType.addInventory(15);
        expect(incomeType.incomeMultiplier).toBe(1.25);

        // Add to 50 items - should get 1.5x
        incomeType.addInventory(25);
        expect(incomeType.incomeMultiplier).toBe(1.5);

        // Add to 100 items - should get 2x
        incomeType.addInventory(50);
        expect(incomeType.incomeMultiplier).toBe(2);

        // Add to 250 items - should get 2.5x
        incomeType.addInventory(150);
        expect(incomeType.incomeMultiplier).toBe(2.5);

        // Add to 500 items - should get 3x
        incomeType.addInventory(250);
        expect(incomeType.incomeMultiplier).toBe(3);

        // Add to 1000 items - should get 4x
        incomeType.addInventory(500);
        expect(incomeType.incomeMultiplier).toBe(4);
    });

    it('hardware costs scale at 3x per level', () => {
        const cpu = state.hardware.find((h) => h.id === 'cpu');
        expect(cpu).toBeDefined();
        if (!cpu) throw new Error('cpu hardware not found');

        expect(cpu.getCost()).toBe(1_000); // Level 0

        cpu.upgrade();
        expect(cpu.getCost()).toBe(3_000); // Level 1: 1000 * 3

        cpu.upgrade();
        expect(cpu.getCost()).toBe(9_000); // Level 2: 1000 * 3^2
    });
});
