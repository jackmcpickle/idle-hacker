import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, type GameContext } from '.';
import { UPGRADE_HARDWARE, START_HACK, GAME_TICK } from './actions';
import { createFreshState } from './testHelpers';

describe('Mid Game State', () => {
    let state: GameContext;

    beforeEach(() => {
        state = createFreshState();
        // Set up mid-game state: some money, inventory, and hardware
        state.bank = 500_000_000;
        state.totalEarned = 1_000_000_000;
        state.incomeTypes[0].addInventory(24); // 25 total Business Cards (hits 1.25x multiplier)
        state.incomeTypes[1].addInventory(10); // 10 Freelance Tasks
    });

    it('has level multipliers applied from inventory thresholds', () => {
        const businessCards = state.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );
        // At 25 inventory, should have 1.25x income multiplier
        expect(businessCards?.incomeMultiplier).toBe(1.25);
        expect(businessCards?.timeMultiplier).toBe(1.25);
    });

    it('can upgrade multiple hardware pieces', () => {
        // Upgrade CPU twice, RAM once
        // CPU: 1000, 3000 = 4000
        // RAM: 10000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' }); // 1000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' }); // 3000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // 10000

        const cpu = state.hardware.find((h) => h.id === 'cpu');
        const ram = state.hardware.find((h) => h.id === 'ram');
        expect(cpu?.level).toBe(2);
        expect(ram?.level).toBe(1);
        expect(state.bank).toBe(500_000_000 - 1000 - 3000 - 10000);
    });

    it('hardware speed bonus affects income countdown', () => {
        // Upgrade CPU to level 2 (0.1 * 2 = 0.2 speed bonus)
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' });
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' });

        const speedBonus = state.hardware.reduce(
            (sum, hw) => sum + hw.getSpeedBonus(),
            0,
        );
        expect(speedBonus).toBe(0.2);

        // Speed multiplier should be 1.2
        const speedMultiplier = 1 + speedBonus;
        expect(speedMultiplier).toBe(1.2);
    });

    it('RAM upgrades increase hack slots', () => {
        // Need RAM level 3 for 2 slots
        // RAM: 10000, 30000, 90000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // 10000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // 30000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // 90000

        expect(state.maxHackSlots).toBe(2);
        expect(state.activeHacks).toHaveLength(2);
    });

    it('can run multiple hacks with enough slots and hardware', () => {
        // Upgrade hardware for hack requirements
        // CPU: 1000, 3000 = 4000 total
        // RAM: 10000, 30000, 90000 = 130000 total
        // Network: 1000000
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' }); // level 1
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' }); // level 2
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // level 1
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // level 2
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'ram' }); // level 3 (2 slots)
        state = gameReducer(state, {
            type: UPGRADE_HARDWARE,
            data: 'network',
        }); // level 1

        // Start two hacks
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'wifi-crack', slot: 0 },
        });
        state = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'email-phish', slot: 1 },
        });

        expect(state.activeHacks[0]?.jobId).toBe('wifi-crack');
        expect(state.activeHacks[1]?.jobId).toBe('email-phish');
    });

    it('game tick with hardware bonus collects faster', () => {
        // Upgrade CPU for speed bonus (costs 1000)
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' }); // 0.1 bonus

        const now = Date.now();
        state.incomeTimers = {};

        // Initialize timer
        state = gameReducer(state, { type: GAME_TICK, data: { now } });

        // With 1.1x speed multiplier, 5000ms countdown becomes ~4545ms
        // So at 4600ms we should collect
        const adjusted = now + 4600;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: adjusted },
        });

        expect(newState.bank).toBeGreaterThan(state.bank);
    });

    it('hack drains cost over time during game tick', () => {
        // Setup for hack (CPU costs 1000)
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' });

        // Start hack
        const startTime = Date.now();
        state.activeHacks[0] = {
            jobId: 'wifi-crack',
            startedAt: startTime,
            endsAt: startTime + 60000,
            totalCostPaid: 0,
            lastCostTick: startTime,
        };

        const initialBank = state.bank;

        // Tick 10 seconds later
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: startTime + 10000 },
        });

        // Cost should be drained (wifi-crack costs 100 over 60s = ~1.67/sec)
        expect(newState.bank).toBeLessThan(initialBank);
        expect(newState.activeHacks[0]?.totalCostPaid).toBeGreaterThan(0);
    });
});
