import type { HardwareId } from './HardwareItem';

export type HackJobId = string;

type HardwareRequirement = Partial<Record<HardwareId, number>>;

type HackJobConfig = {
    id: HackJobId;
    name: string;
    description: string;
    duration: number; // ms
    cost: number;
    influenceReward: number;
    requiredHardware: HardwareRequirement;
    tier: number;
};

const HACK_JOBS: HackJobConfig[] = [
    {
        id: 'wifi-crack',
        name: 'Crack WiFi',
        description: 'Crack neighbor WiFi password',
        duration: 60_000,
        cost: 100,
        influenceReward: 10,
        requiredHardware: { cpu: 1 },
        tier: 1,
    },
    {
        id: 'email-phish',
        name: 'Phishing Email',
        description: 'Send targeted phishing emails',
        duration: 120_000,
        cost: 10_000,
        influenceReward: 1_000,
        requiredHardware: { cpu: 2, network: 1 },
        tier: 1,
    },
    {
        id: 'social-scrape',
        name: 'Social Media Scrape',
        description: 'Scrape social media data',
        duration: 180_000,
        cost: 1_000_000,
        influenceReward: 100_000,
        requiredHardware: { cpu: 2, ram: 2, hdd: 1 },
        tier: 2,
    },
    {
        id: 'ddos-small',
        name: 'Small DDoS',
        description: 'DDoS a small website',
        duration: 300_000,
        cost: 100_000_000,
        influenceReward: 10_000_000,
        requiredHardware: { cpu: 3, network: 2, router: 1 },
        tier: 2,
    },
    {
        id: 'db-breach',
        name: 'Database Breach',
        description: 'Breach a company database',
        duration: 600_000,
        cost: 10_000_000_000,
        influenceReward: 1_000_000_000,
        requiredHardware: { cpu: 4, ram: 3, hdd: 2, network: 2 },
        tier: 3,
    },
    {
        id: 'ransomware',
        name: 'Ransomware Attack',
        description: 'Deploy ransomware on target',
        duration: 900_000,
        cost: 1_000_000_000_000,
        influenceReward: 100_000_000_000,
        requiredHardware: { cpu: 5, ram: 4, hdd: 3, network: 3, router: 2 },
        tier: 3,
    },
    {
        id: 'govt-hack',
        name: 'Government Hack',
        description: 'Infiltrate government systems',
        duration: 1_800_000,
        cost: 100_000_000_000_000,
        influenceReward: 10_000_000_000_000,
        requiredHardware: { cpu: 7, ram: 6, hdd: 5, network: 5, router: 4 },
        tier: 4,
    },
];

export class HackingJob {
    readonly id: HackJobId;
    readonly name: string;
    readonly description: string;
    readonly duration: number;
    readonly cost: number;
    readonly influenceReward: number;
    readonly requiredHardware: HardwareRequirement;
    readonly tier: number;

    constructor(id: HackJobId) {
        const config = HACK_JOBS.find((j) => j.id === id);
        if (!config) throw new Error(`Unknown hack job: ${id}`);

        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.duration = config.duration;
        this.cost = config.cost;
        this.influenceReward = config.influenceReward;
        this.requiredHardware = config.requiredHardware;
        this.tier = config.tier;
    }

    meetsRequirements(hardware: Record<HardwareId, number>): boolean {
        for (const [id, level] of Object.entries(this.requiredHardware)) {
            if ((hardware[id as HardwareId] ?? 0) < level) {
                return false;
            }
        }
        return true;
    }

    formatDuration(): string {
        const mins = Math.floor(this.duration / 60_000);
        const secs = Math.floor((this.duration % 60_000) / 1000);
        if (mins === 0) return `${secs}s`;
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs}s`;
    }

    getCostPerSecond(): number {
        return this.cost / (this.duration / 1000);
    }

    getTotalCost(): number {
        return this.cost;
    }

    static getAll(): HackingJob[] {
        return HACK_JOBS.map((j) => new HackingJob(j.id));
    }

    static getByTier(tier: number): HackingJob[] {
        return HACK_JOBS.filter((j) => j.tier === tier).map(
            (j) => new HackingJob(j.id),
        );
    }
}

export type ActiveHack = {
    jobId: HackJobId;
    startedAt: number;
    endsAt: number;
    totalCostPaid: number;
    lastCostTick: number;
};
