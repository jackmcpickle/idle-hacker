import { displayHigh } from '@/utils/displayHigh';

export class NumberUnit {
    number: number;
    constructor(number: number) {
        this.number = number;
    }

    real() {
        return this.number;
    }

    display() {
        return displayHigh(this.number);
    }

    add(number: number) {
        this.number += number;
    }

    subtract(number: number) {
        this.number -= number;
    }
}
