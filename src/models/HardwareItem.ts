import type { LucideIcon } from 'lucide-react';
import { Cpu, HardDrive, MemoryStick, Wifi, Router } from 'lucide-react';

export type HardwareId = 'cpu' | 'ram' | 'hdd' | 'network' | 'router';

type HardwareConfig = {
    id: HardwareId;
    name: string;
    description: string;
    baseCost: number;
    speedBonusPerLevel: number;
    maxLevel: number;
    unlockHackTier: number;
    icon: LucideIcon;
};

const HARDWARE_CONFIGS: HardwareConfig[] = [
    {
        id: 'cpu',
        name: 'CPU',
        description: 'Faster processing, faster income',
        baseCost: 100,
        speedBonusPerLevel: 0.05,
        maxLevel: 10,
        unlockHackTier: 1,
        icon: Cpu,
    },
    {
        id: 'ram',
        name: 'RAM',
        description: 'More memory, more parallel tasks',
        baseCost: 150,
        speedBonusPerLevel: 0.03,
        maxLevel: 10,
        unlockHackTier: 1,
        icon: MemoryStick,
    },
    {
        id: 'hdd',
        name: 'Storage',
        description: 'Store more data for bigger jobs',
        baseCost: 200,
        speedBonusPerLevel: 0.02,
        maxLevel: 10,
        unlockHackTier: 2,
        icon: HardDrive,
    },
    {
        id: 'network',
        name: 'Network Card',
        description: 'Faster connection speeds',
        baseCost: 300,
        speedBonusPerLevel: 0.04,
        maxLevel: 10,
        unlockHackTier: 2,
        icon: Wifi,
    },
    {
        id: 'router',
        name: 'Router',
        description: 'Better routing, harder to trace',
        baseCost: 500,
        speedBonusPerLevel: 0.03,
        maxLevel: 10,
        unlockHackTier: 3,
        icon: Router,
    },
];

export class HardwareItem {
    readonly id: HardwareId;
    readonly name: string;
    readonly description: string;
    readonly baseCost: number;
    readonly speedBonusPerLevel: number;
    readonly maxLevel: number;
    readonly unlockHackTier: number;
    readonly icon: LucideIcon;
    level: number;

    constructor(id: HardwareId, level = 0) {
        const config = HARDWARE_CONFIGS.find((c) => c.id === id);
        if (!config) throw new Error(`Unknown hardware: ${id}`);

        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.baseCost = config.baseCost;
        this.speedBonusPerLevel = config.speedBonusPerLevel;
        this.maxLevel = config.maxLevel;
        this.unlockHackTier = config.unlockHackTier;
        this.icon = config.icon;
        this.level = level;
    }

    getCost(): number {
        return Math.floor(this.baseCost * Math.pow(2, this.level));
    }

    getSpeedBonus(): number {
        return this.level * this.speedBonusPerLevel;
    }

    canUpgrade(): boolean {
        return this.level < this.maxLevel;
    }

    upgrade(): void {
        if (this.canUpgrade()) {
            this.level += 1;
        }
    }

    getIcon(): LucideIcon {
        return this.icon;
    }

    toJSON(): { id: HardwareId; level: number } {
        return { id: this.id, level: this.level };
    }

    static fromJSON(data: { id: HardwareId; level: number }): HardwareItem {
        return new HardwareItem(data.id, data.level);
    }

    static createAll(): HardwareItem[] {
        return HARDWARE_CONFIGS.map((c) => new HardwareItem(c.id, 0));
    }

    static getIds(): HardwareId[] {
        return HARDWARE_CONFIGS.map((c) => c.id);
    }
}
