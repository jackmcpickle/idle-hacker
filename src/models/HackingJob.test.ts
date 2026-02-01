import { describe, it, expect } from 'vitest';
import { HackingJob } from './HackingJob';

describe('HackingJob', () => {
    describe('constructor', () => {
        it('creates job with correct properties', () => {
            const job = new HackingJob('wifi-crack');
            expect(job.id).toBe('wifi-crack');
            expect(job.name).toBe('Crack WiFi');
            expect(job.duration).toBe(300_000); // 5 minutes
            expect(job.cost).toBe(50);
            expect(job.influenceReward).toBe(500);
            expect(job.tier).toBe(1);
        });

        it('throws for unknown job id', () => {
            expect(() => new HackingJob('unknown')).toThrow(
                'Unknown hack job: unknown',
            );
        });
    });

    describe('meetsRequirements', () => {
        it('returns true when all requirements met', () => {
            const job = new HackingJob('wifi-crack');
            const hardware = { cpu: 1, ram: 0, hdd: 0, network: 0, router: 0 };
            expect(job.meetsRequirements(hardware)).toBe(true);
        });

        it('returns false when requirements not met', () => {
            const job = new HackingJob('wifi-crack');
            const hardware = { cpu: 0, ram: 0, hdd: 0, network: 0, router: 0 };
            expect(job.meetsRequirements(hardware)).toBe(false);
        });

        it('handles complex requirements', () => {
            const job = new HackingJob('social-scrape');
            const insufficient = {
                cpu: 2,
                ram: 1,
                hdd: 0,
                network: 0,
                router: 0,
            };
            expect(job.meetsRequirements(insufficient)).toBe(false);

            const sufficient = {
                cpu: 3,
                ram: 2,
                hdd: 1,
                network: 0,
                router: 0,
            };
            expect(job.meetsRequirements(sufficient)).toBe(true);
        });
    });

    describe('formatDuration', () => {
        it('formats seconds only', () => {
            const job = new HackingJob('wifi-crack');
            expect(job.formatDuration()).toBe('5m'); // 5 minutes
        });

        it('formats minutes and seconds', () => {
            const job = new HackingJob('email-phish');
            expect(job.formatDuration()).toBe('15m'); // 15 minutes
        });
    });

    describe('getAll', () => {
        it('returns all jobs', () => {
            const jobs = HackingJob.getAll();
            expect(jobs.length).toBeGreaterThan(0);
            expect(jobs.every((j) => j instanceof HackingJob)).toBe(true);
        });
    });

    describe('getByTier', () => {
        it('filters by tier', () => {
            const tier1 = HackingJob.getByTier(1);
            expect(tier1.every((j) => j.tier === 1)).toBe(true);
            expect(tier1.length).toBeGreaterThan(0);

            const tier3 = HackingJob.getByTier(3);
            expect(tier3.every((j) => j.tier === 3)).toBe(true);
        });

        it('returns empty for non-existent tier', () => {
            const tier99 = HackingJob.getByTier(99);
            expect(tier99).toHaveLength(0);
        });
    });
});
