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
                cost: 1_000,
                income: 500,
                countdown: 6000,
                unlockIncome: 1_000,
            }),
            new IncomeType({
                name: 'Resume Updates',
                cost: 100_000,
                income: 50_000,
                countdown: 8000,
                unlockIncome: 100_000,
            }),
            new IncomeType({
                name: 'Bug Bounties',
                cost: 10_000_000,
                income: 5_000_000,
                countdown: 15000,
                unlockIncome: 10_000_000,
            }),
            new IncomeType({
                name: 'Basic Website',
                cost: 1_000_000_000,
                income: 500_000_000,
                countdown: 30000,
                unlockIncome: 1_000_000_000,
            }),
            new IncomeType({
                name: 'Consulting',
                cost: 100_000_000_000,
                income: 50_000_000_000,
                countdown: 45000,
                unlockIncome: 100_000_000_000,
            }),
            new IncomeType({
                name: 'E-commerce Site',
                cost: 10_000_000_000_000,
                income: 5_000_000_000_000,
                countdown: 60000,
                unlockIncome: 10_000_000_000_000,
            }),
            new IncomeType({
                name: 'SaaS Platform',
                cost: 1_000_000_000_000_000,
                income: 500_000_000_000_000,
                countdown: 90000,
                unlockIncome: 1_000_000_000_000_000,
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
