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
    #cost: number;
    #income: number;
    #countdown: number;
    #inventory: number;
    #timeMultiplier: number;
    #incomeMultiplier: number;

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
        this.#cost = cost;
        this.#income = income;
        this.#countdown = countdown;
        this.#inventory = inventory;
        this.#timeMultiplier = timeMultiplier;
        this.#incomeMultiplier = incomeMultiplier;
    }

    set addInventory(value: number) {
        this.#inventory += value;
    }

    getInventory() {
        return this.#inventory;
    }

    getCost() {
        return this.#cost;
    }

    getCountdown() {
        return this.#countdown / this.#timeMultiplier;
    }

    getIncome() {
        return this.#inventory * this.#income * this.#incomeMultiplier;
    }

    hasInventory() {
        return this.#inventory > 0;
    }
}

export const INCOME_TYPES = [
    new IncomeType({ name: 'Business Cards', cost: 10, income: 5, countdown: 2000, inventory: 1 }),
    new IncomeType({ name: 'Resume Updates', cost: 20, income: 10, countdown: 5000 }),
];
