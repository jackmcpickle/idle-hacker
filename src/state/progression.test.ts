import { describe, it, expect, beforeEach } from 'vitest';
import type { GameContext } from '.';
import { IncomeType } from '@/models/IncomeType';
import { createFreshState } from './testHelpers';

describe('Progression Milestones', () => {
    let state: GameContext;

    beforeEach(() => {
        state = createFreshState();
    });

    it('unlocks Freelance Tasks', () => {
        const freelance = state.incomeTypes.find(
            (i) => i.name === 'Freelance Tasks',
        );
        expect(freelance?.unlockIncome).toBeGreaterThan(0);
    });

    it('unlocks Bug Bounties', () => {
        const bugBounties = state.incomeTypes.find(
            (i) => i.name === 'Bug Bounties',
        );
        expect(bugBounties?.unlockIncome).toBeGreaterThan(0);
    });

    it('unlocks SaaS Platform as final tier', () => {
        const saas = state.incomeTypes.find((i) => i.name === 'SaaS Platform');
        expect(saas?.unlockIncome).toBeGreaterThan(0);
    });

    it('level multipliers scale correctly', () => {
        // Test multiplier thresholds (new reduced scaling, max 2x)
        const incomeType = new IncomeType({
            name: 'Test',
            cost: 10,
            income: 10,
            countdown: 1000,
            inventory: 0,
            unlockIncome: 0,
        });

        // Add 25 items - should get 1.05x
        incomeType.addInventory(25);
        expect(incomeType.incomeMultiplier).toBe(1.05);

        // Add to 50 items - should get 1.1x
        incomeType.addInventory(25);
        expect(incomeType.incomeMultiplier).toBe(1.1);

        // Add to 100 items - should get 1.15x
        incomeType.addInventory(50);
        expect(incomeType.incomeMultiplier).toBe(1.15);

        // Add to 250 items - should get 1.2x
        incomeType.addInventory(150);
        expect(incomeType.incomeMultiplier).toBe(1.2);

        // Add to 500 items - should get 1.3x
        incomeType.addInventory(250);
        expect(incomeType.incomeMultiplier).toBe(1.3);

        // Add to 1000 items - should get 1.4x
        incomeType.addInventory(500);
        expect(incomeType.incomeMultiplier).toBe(1.4);

        // Add to 5000 items - should get 1.8x
        incomeType.addInventory(4000);
        expect(incomeType.incomeMultiplier).toBe(1.8);

        // Add to 10000 items - should get 2x (max)
        incomeType.addInventory(5000);
        expect(incomeType.incomeMultiplier).toBe(2);
    });

    it('hardware costs scale at 4x per level', () => {
        const cpu = state.hardware.find((h) => h.id === 'cpu');
        expect(cpu).toBeDefined();
        if (!cpu) throw new Error('cpu hardware not found');

        expect(cpu.getCost()).toBe(250); // Level 0

        cpu.upgrade();
        expect(cpu.getCost()).toBe(1_000); // Level 1: 250 * 4

        cpu.upgrade();
        expect(cpu.getCost()).toBe(4_000); // Level 2: 250 * 4^2
    });
});
