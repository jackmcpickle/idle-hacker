import { INITIAL_GAME_STATE, type GameContext } from '.';
import { HardwareItem } from '@/models/HardwareItem';
import { IncomeType } from '@/models/IncomeType';

// Helper to create a fresh state for testing
export function createFreshState(): GameContext {
    return {
        ...INITIAL_GAME_STATE,
        incomeTypes: [
            new IncomeType({
                name: 'Business Cards',
                cost: 10,
                income: 5,
                countdown: 5000,
                inventory: 1,
                unlockIncome: 0,
            }),
            new IncomeType({
                name: 'Freelance Tasks',
                cost: 30,
                income: 8,
                countdown: 6000,
                unlockIncome: 500,
            }),
            new IncomeType({
                name: 'Resume Updates',
                cost: 80,
                income: 15,
                countdown: 8000,
                unlockIncome: 2000,
            }),
            new IncomeType({
                name: 'Bug Bounties',
                cost: 200,
                income: 40,
                countdown: 15000,
                unlockIncome: 10000,
            }),
            new IncomeType({
                name: 'Basic Website',
                cost: 600,
                income: 100,
                countdown: 30000,
                unlockIncome: 50000,
            }),
            new IncomeType({
                name: 'Consulting',
                cost: 2000,
                income: 350,
                countdown: 45000,
                unlockIncome: 250000,
            }),
            new IncomeType({
                name: 'E-commerce Site',
                cost: 8000,
                income: 1200,
                countdown: 60000,
                unlockIncome: 1500000,
            }),
            new IncomeType({
                name: 'SaaS Platform',
                cost: 30000,
                income: 5000,
                countdown: 90000,
                unlockIncome: 10000000,
            }),
        ],
        hardware: HardwareItem.createAll(),
        activeHacks: [null],
        maxHackSlots: 1,
        lastSyncedAt: Date.now(),
        incomeTimers: {},
        globalTick: Date.now(),
        completedHacks: [],
    };
}
