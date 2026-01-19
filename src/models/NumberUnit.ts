import { displayHigh } from '@/utils/displayHigh';

export class NumberUnit {
    number: number;
    constructor(number: number) {
        this.number = number;
    }

    real(): number {
        return this.number;
    }

    display(): string {
        return displayHigh(this.number);
    }

    add(number: number): void {
        this.number += number;
    }

    subtract(number: number): void {
        this.number -= number;
    }
}
