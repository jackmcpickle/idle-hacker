import { describe, it, expect } from 'vitest';
import { HardwareItem } from './HardwareItem';

describe('HardwareItem', () => {
    describe('constructor', () => {
        it('creates item with default level 0', () => {
            const hw = new HardwareItem('cpu');
            expect(hw.level).toBe(0);
            expect(hw.id).toBe('cpu');
            expect(hw.name).toBe('CPU');
        });

        it('creates item with specified level', () => {
            const hw = new HardwareItem('ram', 5);
            expect(hw.level).toBe(5);
        });

        it('throws for unknown hardware id', () => {
            expect(() => new HardwareItem('unknown' as never)).toThrow(
                'Unknown hardware: unknown',
            );
        });
    });

    describe('getCost', () => {
        it('returns base cost at level 0', () => {
            const hw = new HardwareItem('cpu');
            expect(hw.getCost()).toBe(250);
        });

        it('increases cost by 4x per level', () => {
            const hw = new HardwareItem('cpu', 1);
            expect(hw.getCost()).toBe(1_000); // 250 * 4^1

            const hw2 = new HardwareItem('cpu', 2);
            expect(hw2.getCost()).toBe(4_000); // 250 * 4^2

            const hw3 = new HardwareItem('cpu', 3);
            expect(hw3.getCost()).toBe(16_000); // 250 * 4^3
        });
    });

    describe('getSpeedBonus', () => {
        it('returns 0 at level 0', () => {
            const hw = new HardwareItem('cpu');
            expect(hw.getSpeedBonus()).toBe(0);
        });

        it('returns bonus proportional to level', () => {
            const hw = new HardwareItem('cpu', 5);
            expect(hw.getSpeedBonus()).toBe(0.25); // 5 * 0.05 = 0.25
        });
    });

    describe('canUpgrade', () => {
        it('returns true when below max level', () => {
            const hw = new HardwareItem('cpu', 5);
            expect(hw.canUpgrade()).toBe(true);
        });

        it('returns false at max level', () => {
            const hw = new HardwareItem('cpu', 10);
            expect(hw.canUpgrade()).toBe(false);
        });
    });

    describe('upgrade', () => {
        it('increments level when possible', () => {
            const hw = new HardwareItem('cpu', 5);
            hw.upgrade();
            expect(hw.level).toBe(6);
        });

        it('does not exceed max level', () => {
            const hw = new HardwareItem('cpu', 10);
            hw.upgrade();
            expect(hw.level).toBe(10);
        });
    });

    describe('toJSON/fromJSON', () => {
        it('serializes and deserializes correctly', () => {
            const hw = new HardwareItem('ram', 7);
            const json = hw.toJSON();

            expect(json).toEqual({ id: 'ram', level: 7 });

            const restored = HardwareItem.fromJSON(json);
            expect(restored.id).toBe('ram');
            expect(restored.level).toBe(7);
        });
    });

    describe('createAll', () => {
        it('creates all hardware items at level 0', () => {
            const all = HardwareItem.createAll();
            expect(all).toHaveLength(5);
            expect(all.every((h) => h.level === 0)).toBe(true);
            expect(all.map((h) => h.id)).toEqual([
                'cpu',
                'ram',
                'hdd',
                'network',
                'router',
            ]);
        });
    });

    describe('getIds', () => {
        it('returns all hardware ids', () => {
            const ids = HardwareItem.getIds();
            expect(ids).toEqual(['cpu', 'ram', 'hdd', 'network', 'router']);
        });
    });
});
