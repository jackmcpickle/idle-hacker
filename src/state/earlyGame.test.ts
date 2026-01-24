import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, type GameContext } from '.';
import {
    COLLECT_INCOME,
    INCREASE_QTY,
    UPGRADE_HARDWARE,
    START_HACK,
    GAME_TICK,
} from './actions';
import { createFreshState } from './testHelpers';

describe('Early Game State', () => {
    let state: GameContext;

    beforeEach(() => {
        state = createFreshState();
    });

    it('starts with correct initial values', () => {
        expect(state.bank).toBe(0);
        expect(state.influence).toBe(0);
        expect(state.totalEarned).toBe(0);
        expect(state.totalSpent).toBe(0);
        expect(state.totalHacksCompleted).toBe(0);
        expect(state.maxHackSlots).toBe(1);
    });

    it('starts with one Business Card', () => {
        const businessCards = state.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );
        expect(businessCards?.inventory).toBe(1);
    });

    it('starts with all hardware at level 0', () => {
        for (const hw of state.hardware) {
            expect(hw.level).toBe(0);
        }
    });

    it('collects income and updates bank', () => {
        const newState = gameReducer(state, {
            type: COLLECT_INCOME,
            data: 100,
        });

        expect(newState.bank).toBe(100);
        expect(newState.totalEarned).toBe(100);
    });

    it('can purchase additional income sources', () => {
        // Give player some money first
        state = gameReducer(state, { type: COLLECT_INCOME, data: 50 });

        // Buy more business cards
        const newState = gameReducer(state, {
            type: INCREASE_QTY,
            data: { name: 'Business Cards', qty: 2 },
        });

        const businessCards = newState.incomeTypes.find(
            (i) => i.name === 'Business Cards',
        );
        expect(businessCards?.inventory).toBe(3);
        expect(newState.bank).toBe(30); // 50 - (10 * 2)
        expect(newState.totalSpent).toBe(20);
    });

    it('can upgrade hardware when affordable', () => {
        // Give player money for CPU upgrade (costs 100)
        state = gameReducer(state, { type: COLLECT_INCOME, data: 150 });

        const newState = gameReducer(state, {
            type: UPGRADE_HARDWARE,
            data: 'cpu',
        });

        const cpu = newState.hardware.find((h) => h.id === 'cpu');
        expect(cpu?.level).toBe(1);
        expect(newState.bank).toBe(50);
        expect(newState.totalSpent).toBe(100);
    });

    it('cannot start hack without required hardware', () => {
        // wifi-crack requires CPU level 1
        const newState = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'wifi-crack', slot: 0 },
        });

        // Should not start - no active hack
        expect(newState.activeHacks[0]).toBeNull();
    });

    it('can start hack after upgrading hardware', () => {
        // Upgrade CPU to level 1
        state = gameReducer(state, { type: COLLECT_INCOME, data: 500 });
        state = gameReducer(state, { type: UPGRADE_HARDWARE, data: 'cpu' });

        const newState = gameReducer(state, {
            type: START_HACK,
            data: { jobId: 'wifi-crack', slot: 0 },
        });

        expect(newState.activeHacks[0]).not.toBeNull();
        expect(newState.activeHacks[0]?.jobId).toBe('wifi-crack');
    });

    it('game tick initializes income timer on first tick', () => {
        const now = Date.now();
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now },
        });

        expect(newState.incomeTimers['Business Cards']).toBe(now);
    });

    it('game tick collects income after countdown elapsed', () => {
        const now = Date.now();

        // First tick to initialize timer
        state = gameReducer(state, {
            type: GAME_TICK,
            data: { now },
        });

        // Tick after countdown (5000ms for Business Cards)
        const laterTick = now + 5000;
        const newState = gameReducer(state, {
            type: GAME_TICK,
            data: { now: laterTick },
        });

        expect(newState.bank).toBe(5); // 1 inventory * 5 income
        expect(newState.totalEarned).toBe(5);
    });
});
