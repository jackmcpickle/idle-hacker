import { describe, it, expect } from 'vitest';
import {
    createInitialState,
    processTick,
    applyAction,
    calculateIncomePerSecond,
    getHardwareCost,
    getHardwareSpeedBonus,
    calculateMaxHackSlots,
    isIncomeUnlocked,
    canStartHack,
    getAvailableHackSlot,
} from './engine';
import { DEFAULT_BALANCE_CONFIG } from './config';

describe('Simulation Engine', () => {
    describe('createInitialState', () => {
        it('creates state with correct initial values', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);

            expect(state.bank).toBe(0);
            expect(state.influence).toBe(0);
            expect(state.totalEarned).toBe(0);
            expect(state.incomeTypes.length).toBe(8);
            expect(state.hardware.length).toBe(5);
            expect(state.maxHackSlots).toBe(1);
            expect(state.activeHacks.length).toBe(1);
        });

        it('starts with 1 Business Card', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const businessCards = state.incomeTypes.find(
                (t) => t.name === 'Business Cards',
            );

            expect(businessCards?.inventory).toBe(1);
        });

        it('all hardware starts at level 0', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);

            for (const hw of state.hardware) {
                expect(hw.level).toBe(0);
            }
        });
    });

    describe('processTick', () => {
        it('collects income when countdown elapsed', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            // Set timer to a past time
            state = { ...state, incomeTimers: { 'Business Cards': 0 } };

            // Process enough time for income to collect (8 seconds + buffer)
            state = processTick(state, DEFAULT_BALANCE_CONFIG, 8100);

            expect(state.bank).toBeGreaterThan(0);
            expect(state.totalEarned).toBeGreaterThan(0);
        });

        it('does not collect income before countdown', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = { ...state, incomeTimers: { 'Business Cards': 0 } };

            // Process less time than countdown (5 seconds)
            state = processTick(state, DEFAULT_BALANCE_CONFIG, 1000);

            expect(state.bank).toBe(0);
        });

        it('completes active hack when time elapsed', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                bank: 1000,
                hardware: state.hardware.map((hw) =>
                    hw.id === 'cpu' ? { ...hw, level: 1 } : hw,
                ),
                activeHacks: [
                    {
                        jobId: 'wifi-crack',
                        startedAt: 0,
                        endsAt: 300000, // 5 minutes
                        totalCostPaid: 50, // Already paid full cost
                        lastCostTick: 0,
                    },
                ],
            };

            // Process past the end time
            state = processTick(state, DEFAULT_BALANCE_CONFIG, 301000);

            expect(state.activeHacks[0]).toBeNull();
            expect(state.influence).toBe(500); // WiFi crack reward
            expect(state.totalHacksCompleted).toBe(1);
        });
    });

    describe('applyAction', () => {
        it('buys income when affordable', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = { ...state, bank: 100, totalEarned: 100 };

            state = applyAction(
                state,
                { type: 'buy_income', name: 'Business Cards', quantity: 1 },
                DEFAULT_BALANCE_CONFIG,
            );

            const businessCards = state.incomeTypes.find(
                (t) => t.name === 'Business Cards',
            );
            expect(businessCards?.inventory).toBe(2);
            expect(state.bank).toBe(90); // 100 - 10 cost
        });

        it('does not buy income when not affordable', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = { ...state, bank: 5 };

            state = applyAction(
                state,
                { type: 'buy_income', name: 'Business Cards', quantity: 1 },
                DEFAULT_BALANCE_CONFIG,
            );

            const businessCards = state.incomeTypes.find(
                (t) => t.name === 'Business Cards',
            );
            expect(businessCards?.inventory).toBe(1); // Unchanged
        });

        it('upgrades hardware when affordable', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = { ...state, bank: 250 };

            state = applyAction(
                state,
                { type: 'upgrade_hardware', id: 'cpu' },
                DEFAULT_BALANCE_CONFIG,
            );

            const cpu = state.hardware.find((h) => h.id === 'cpu');
            expect(cpu?.level).toBe(1);
            expect(state.bank).toBe(0); // 250 - 250 cost
        });

        it('increases max hack slots when RAM upgraded', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = { ...state, bank: 1000000 };

            // Upgrade RAM to level 3 (need 10k + 30k + 90k = 130k)
            for (let i = 0; i < 3; i += 1) {
                state = applyAction(
                    state,
                    { type: 'upgrade_hardware', id: 'ram' },
                    DEFAULT_BALANCE_CONFIG,
                );
            }

            expect(state.maxHackSlots).toBe(2);
            expect(state.activeHacks.length).toBe(2);
        });

        it('starts hack when requirements met', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                hardware: state.hardware.map((hw) =>
                    hw.id === 'cpu' ? { ...hw, level: 1 } : hw,
                ),
            };

            state = applyAction(
                state,
                { type: 'start_hack', jobId: 'wifi-crack', slot: 0 },
                DEFAULT_BALANCE_CONFIG,
            );

            expect(state.activeHacks[0]).not.toBeNull();
            expect(state.activeHacks[0]?.jobId).toBe('wifi-crack');
        });

        it('does not start hack when requirements not met', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);

            const newState = applyAction(
                state,
                { type: 'start_hack', jobId: 'wifi-crack', slot: 0 },
                DEFAULT_BALANCE_CONFIG,
            );

            expect(newState.activeHacks[0]).toBeNull();
        });
    });

    describe('calculateIncomePerSecond', () => {
        it('calculates income rate correctly', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const incomePerSec = calculateIncomePerSecond(
                state,
                DEFAULT_BALANCE_CONFIG,
            );

            // 1 Business Card: 1 income per 8 seconds = 0.125 per second
            expect(incomePerSec).toBeCloseTo(0.125, 2);
        });

        it('scales with inventory', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                incomeTypes: state.incomeTypes.map((t) =>
                    t.name === 'Business Cards'
                        ? { ...t, inventory: 10, incomeMultiplier: 1.05, timeMultiplier: 1.05 }
                        : t,
                ),
            };

            const incomePerSec = calculateIncomePerSecond(
                state,
                DEFAULT_BALANCE_CONFIG,
            );

            // 10 Business Cards with 1.05x multiplier:
            // income = 10 * 1 * 1.05 = 10.5 per tick
            // countdown = 8000 / 1.05 = 7619ms
            // ticks per second = 1000 / 7619 = 0.131
            // income per second = 10.5 * 0.131 = 1.38
            expect(incomePerSec).toBeCloseTo(1.38, 0);
        });
    });

    describe('getHardwareCost', () => {
        it('calculates cost with exponential scaling', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const cpu = state.hardware.find((h) => h.id === 'cpu');
            if (!cpu) throw new Error('CPU not found');

            // Level 0: 250 * 4^0 = 250
            expect(getHardwareCost(cpu, DEFAULT_BALANCE_CONFIG)).toBe(250);

            // Level 1: 250 * 4^1 = 1000
            cpu.level = 1;
            expect(getHardwareCost(cpu, DEFAULT_BALANCE_CONFIG)).toBe(1000);

            // Level 2: 250 * 4^2 = 4000
            cpu.level = 2;
            expect(getHardwareCost(cpu, DEFAULT_BALANCE_CONFIG)).toBe(4000);
        });
    });

    describe('getHardwareSpeedBonus', () => {
        it('sums speed bonuses from all hardware', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            expect(getHardwareSpeedBonus(state)).toBe(0);

            state = {
                ...state,
                hardware: state.hardware.map((hw) => ({ ...hw, level: 1 })),
            };

            // CPU: 0.05, RAM: 0.04, HDD: 0.03, Network: 0.04, Router: 0.04 = 0.2
            expect(getHardwareSpeedBonus(state)).toBeCloseTo(0.2, 2);
        });
    });

    describe('calculateMaxHackSlots', () => {
        it('returns 1 for RAM level 0-2', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            expect(calculateMaxHackSlots(state)).toBe(1);

            const ram = state.hardware.find((h) => h.id === 'ram');
            if (ram) ram.level = 2;
            expect(calculateMaxHackSlots(state)).toBe(1);
        });

        it('returns 2 for RAM level 3-5', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const ram = state.hardware.find((h) => h.id === 'ram');
            if (ram) ram.level = 3;
            expect(calculateMaxHackSlots(state)).toBe(2);

            if (ram) ram.level = 5;
            expect(calculateMaxHackSlots(state)).toBe(2);
        });

        it('returns 4 for RAM level 9+', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const ram = state.hardware.find((h) => h.id === 'ram');
            if (ram) ram.level = 9;
            expect(calculateMaxHackSlots(state)).toBe(4);
        });
    });

    describe('isIncomeUnlocked', () => {
        it('returns true when totalEarned >= unlockIncome', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            const freelance = state.incomeTypes.find(
                (t) => t.name === 'Freelance Tasks',
            );
            if (!freelance) throw new Error('Freelance Tasks not found');

            expect(isIncomeUnlocked(freelance, 0)).toBe(false);
            expect(isIncomeUnlocked(freelance, 99)).toBe(false);
            expect(isIncomeUnlocked(freelance, 100)).toBe(true);
            expect(isIncomeUnlocked(freelance, 1000)).toBe(true);
        });
    });

    describe('canStartHack', () => {
        it('returns false when hardware requirements not met', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            expect(canStartHack(state, 'wifi-crack', DEFAULT_BALANCE_CONFIG)).toBe(
                false,
            );
        });

        it('returns true when hardware requirements met', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                hardware: state.hardware.map((hw) =>
                    hw.id === 'cpu' ? { ...hw, level: 1 } : hw,
                ),
            };

            expect(canStartHack(state, 'wifi-crack', DEFAULT_BALANCE_CONFIG)).toBe(
                true,
            );
        });

        it('returns false when no hack slot available', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                hardware: state.hardware.map((hw) =>
                    hw.id === 'cpu' ? { ...hw, level: 1 } : hw,
                ),
                activeHacks: [
                    {
                        jobId: 'wifi-crack',
                        startedAt: 0,
                        endsAt: 60000,
                        totalCostPaid: 0,
                        lastCostTick: 0,
                    },
                ],
            };

            expect(canStartHack(state, 'wifi-crack', DEFAULT_BALANCE_CONFIG)).toBe(
                false,
            );
        });
    });

    describe('getAvailableHackSlot', () => {
        it('returns 0 for empty slots', () => {
            const state = createInitialState(DEFAULT_BALANCE_CONFIG);
            expect(getAvailableHackSlot(state)).toBe(0);
        });

        it('returns -1 when all slots full', () => {
            let state = createInitialState(DEFAULT_BALANCE_CONFIG);
            state = {
                ...state,
                activeHacks: [
                    {
                        jobId: 'wifi-crack',
                        startedAt: 0,
                        endsAt: 60000,
                        totalCostPaid: 0,
                        lastCostTick: 0,
                    },
                ],
            };

            expect(getAvailableHackSlot(state)).toBe(-1);
        });
    });
});
