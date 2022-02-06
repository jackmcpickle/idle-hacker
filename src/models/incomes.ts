import { roundHigh } from '@/utils/round';
import { levelMultiplier } from './levels';

interface IncomeConstructor {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    timeMultiplier?: number;
    inventory?: number;
    incomeMultiplier?: number;
}

export class IncomeType {
    name: string;
    cost: number;
    income: number;
    countdown: number;
    inventory: number;
    timeMultiplier: number;
    incomeMultiplier: number;

    constructor({
        name,
        cost,
        income,
        countdown,
        inventory = 0,
        timeMultiplier = 1,
        incomeMultiplier = 1,
    }: IncomeConstructor) {
        this.name = name;
        this.cost = cost;
        this.income = income;
        this.countdown = countdown;
        this.inventory = inventory;
        this.timeMultiplier = timeMultiplier;
        this.incomeMultiplier = incomeMultiplier;
    }

    addInventory(value: number) {
        this.inventory += value;
        const level = levelMultiplier.find((level) => level.qty <= this.inventory);
        console.log({level});
        if (level) {
            this.timeMultiplier = level.speed;
            this.incomeMultiplier = level.income;
        }
    }

    getValue() {
        return roundHigh(Math.round(this.income * this.incomeMultiplier));
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
        return roundHigh(Math.round(this.inventory * this.income * this.incomeMultiplier));
    }

    hasInventory() {
        return this.inventory > 0;
    }
}

export const INCOME_TYPES = [
    new IncomeType({ name: 'Business Cards', cost: 10, income: 5, countdown: 5000, inventory: 1 }),
    new IncomeType({ name: 'Resume Updates', cost: 50, income: 10, countdown: 10000 }),
    new IncomeType({ name: 'Basic Website', cost: 100, income: 50, countdown: 60000 }),
    new IncomeType({ name: 'E-commerce site', cost: 1000, income: 500, countdown: 120000 }),
];
