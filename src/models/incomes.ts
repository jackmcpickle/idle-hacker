class IncomeType {
    name: string;
    cost: number;
    income: number;
    countdown: number;

    constructor(name: string, cost: number, income: number, countdown: number) {
        this.name = name;
        this.cost = cost;
        this.income = income;
        this.countdown = countdown;
    }
}

export const INCOME_TYPES = [
    new IncomeType('Business Cards', 10, 5, 5000),
    new IncomeType('Resume Updates', 20, 10, 100000),
]