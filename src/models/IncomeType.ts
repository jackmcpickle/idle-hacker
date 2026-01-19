import type { LucideIcon } from 'lucide-react';
import { levelMultiplier } from './levels';
import { NumberUnit } from './NumberUnit';

export type IconComponent = LucideIcon;

interface IncomeConstructor {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    timeMultiplier?: number;
    inventory?: number;
    incomeMultiplier?: number;
    unlockIncome?: number;
    icon: IconComponent;
}

export class IncomeType {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    inventory: number;
    timeMultiplier: number;
    incomeMultiplier: number;
    unlockIncome: number;
    icon: IconComponent;

    constructor({
        name,
        cost,
        income,
        countdown,
        inventory = 0,
        timeMultiplier = 1,
        incomeMultiplier = 1,
        unlockIncome = 0,
        icon,
    }: IncomeConstructor) {
        this.name = name;
        this.cost = cost;
        this.income = income;
        this.countdown = countdown;
        this.inventory = inventory;
        this.timeMultiplier = timeMultiplier;
        this.incomeMultiplier = incomeMultiplier;
        this.unlockIncome = unlockIncome;
        this.icon = icon;
    }

    getIcon(): IconComponent {
        return this.icon;
    }

    isUnlocked(value: number): boolean {
        return this.unlockIncome <= value;
    }

    addInventory(value: number): void {
        this.inventory += value;
        const level = levelMultiplier.find(
            (level) => level.qty <= this.inventory,
        );
        if (level) {
            this.timeMultiplier = level.speed;
            this.incomeMultiplier = level.income;
        }
    }

    getValue(): NumberUnit {
        return new NumberUnit(this.income * this.incomeMultiplier);
    }

    getInventory(): number {
        return this.inventory;
    }

    getCost(): number {
        return this.cost;
    }

    getCountdown(): number {
        return Math.max(this.countdown / this.timeMultiplier, 1000);
    }

    isFastCountdown(): boolean {
        return this.getCountdown() <= 1000;
    }

    getCountdownSec(): string {
        return (this.getCountdown() / 1000).toFixed(2);
    }

    getIncome(): NumberUnit {
        return new NumberUnit(
            this.inventory * this.income * this.incomeMultiplier,
        );
    }

    hasInventory(): boolean {
        return this.inventory > 0;
    }
}
