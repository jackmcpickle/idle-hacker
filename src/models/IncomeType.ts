import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
import { levelMultiplier } from './levels';
import { NumberUnit } from './NumberUnit';

export type IconComponent = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
        title?: string;
        titleId?: string;
    } & RefAttributes<SVGSVGElement>
>;

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

    getIcon() {
        return this.icon;
    }

    isUnlocked(value: number) {
        return this.unlockIncome <= value;
    }

    addInventory(value: number) {
        this.inventory += value;
        const level = levelMultiplier.find(
            (level) => level.qty <= this.inventory,
        );
        console.log({ level });
        if (level) {
            this.timeMultiplier = level.speed;
            this.incomeMultiplier = level.income;
        }
    }

    getValue() {
        return new NumberUnit(this.income * this.incomeMultiplier);
    }

    getInventory() {
        return this.inventory;
    }

    getCost() {
        return this.cost;
    }

    getCountdown() {
        return Math.max(this.countdown / this.timeMultiplier, 1000);
    }

    isFastCountdown() {
        return this.getCountdown() <= 1000;
    }

    getCountdownSec() {
        return (this.getCountdown() / 1000).toFixed(2);
    }

    getIncome() {
        return new NumberUnit(
            this.inventory * this.income * this.incomeMultiplier,
        );
    }

    hasInventory() {
        return this.inventory > 0;
    }
}
