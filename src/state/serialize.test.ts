import { describe, it, expect, beforeEach } from 'vitest';
import {
    serializeState,
    deserializeState,
    calculateOfflineProgress,
} from './serialize';
import { INITIAL_GAME_STATE, type GameContext } from '.';
import { HardwareItem } from '@/models/HardwareItem';

describe('serialize', () => {
    describe('serializeState', () => {
        it('serializes initial state correctly', () => {
            const result = serializeState(INITIAL_GAME_STATE);

            expect(result.bank).toBe(0);
            expect(result.influence).toBe(0);
            expect(result.totalEarned).toBe(0);
            expect(result.purchaseMultiplier).toEqual({
                value: '1',
                isPercent: false,
            });
            expect(result.incomeTypes).toHaveLength(4);
            expect(result.hardware).toHaveLength(5);
            expect(result.activeHacks).toEqual([null]);
            expect(result.maxHackSlots).toBe(1);
        });

        it('preserves income type inventory', () => {
            const state = { ...INITIAL_GAME_STATE };
            state.incomeTypes[0].addInventory(5);
            const result = serializeState(state);

            expect(result.incomeTypes[0].inventory).toBe(6);
        });

        it('preserves hardware levels', () => {
            const state = { ...INITIAL_GAME_STATE };
            state.hardware[0].upgrade();
            state.hardware[0].upgrade();
            const result = serializeState(state);

            expect(result.hardware[0].level).toBe(2);
        });
    });

    describe('deserializeState', () => {
        it('returns null for invalid data', () => {
            expect(deserializeState(null)).toBeNull();
            expect(deserializeState(undefined)).toBeNull();
            expect(deserializeState('string')).toBeNull();
        });

        it('deserializes basic state', () => {
            const serialized = {
                bank: 1000,
                influence: 50,
                totalEarned: 5000,
                purchaseMultiplier: { value: '10', isPercent: false },
            };

            const result = deserializeState(serialized);
            expect(result).not.toBeNull();
            expect(result?.bank).toBe(1000);
            expect(result?.influence).toBe(50);
            expect(result?.totalEarned).toBe(5000);
        });

        it('restores income type inventory', () => {
            const serialized = {
                incomeTypes: [
                    { name: 'Business Cards', inventory: 10 },
                    { name: 'Resume Updates', inventory: 5 },
                ],
            };

            const result = deserializeState(serialized);
            expect(result).not.toBeNull();
            expect(result?.incomeTypes[0].inventory).toBe(10);
            expect(result?.incomeTypes[1].inventory).toBe(5);
        });

        it('restores hardware levels', () => {
            const serialized = {
                hardware: [
                    { id: 'cpu', level: 3 },
                    { id: 'ram', level: 5 },
                ],
            };

            const result = deserializeState(serialized);
            expect(result).not.toBeNull();
            const cpu = result?.hardware.find((h) => h.id === 'cpu');
            const ram = result?.hardware.find((h) => h.id === 'ram');
            expect(cpu?.level).toBe(3);
            expect(ram?.level).toBe(5);
        });

        it('uses defaults for missing fields', () => {
            const result = deserializeState({});
            expect(result).not.toBeNull();
            expect(result?.bank).toBe(0);
            expect(result?.influence).toBe(0);
            expect(result?.maxHackSlots).toBe(1);
        });
    });

    describe('calculateOfflineProgress', () => {
        let state: GameContext;

        beforeEach(() => {
            state = {
                ...INITIAL_GAME_STATE,
                incomeTypes: [...INITIAL_GAME_STATE.incomeTypes],
                hardware: HardwareItem.createAll(),
            };
        });

        it('returns 0 for no time elapsed', () => {
            const now = Date.now();
            const result = calculateOfflineProgress(state, now);
            expect(result.earnedWhileAway).toBe(0);
        });

        it('returns 0 for future timestamp', () => {
            const future = Date.now() + 10000;
            const result = calculateOfflineProgress(state, future);
            expect(result.earnedWhileAway).toBe(0);
        });

        it('calculates earnings based on income types with inventory', () => {
            // Add some inventory
            state.incomeTypes[0].addInventory(10);

            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            const result = calculateOfflineProgress(state, oneHourAgo);

            expect(result.earnedWhileAway).toBeGreaterThan(0);
        });

        it('caps offline progress at 8 hours', () => {
            state.incomeTypes[0].addInventory(10);

            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            const tenHoursAgo = Date.now() - 10 * 60 * 60 * 1000;

            const oneHourResult = calculateOfflineProgress(state, oneHourAgo);
            const tenHourResult = calculateOfflineProgress(state, tenHoursAgo);

            // 10 hour result should be capped, not 10x the 1 hour result
            expect(tenHourResult.earnedWhileAway).toBeLessThan(
                oneHourResult.earnedWhileAway * 10,
            );
        });

        it('returns 0 when no inventory', () => {
            // Reset inventories to 0
            for (const income of state.incomeTypes) {
                while (income.inventory > 0) {
                    income.addInventory(-1);
                }
            }

            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            const result = calculateOfflineProgress(state, oneHourAgo);

            expect(result.earnedWhileAway).toBe(0);
        });
    });
});
