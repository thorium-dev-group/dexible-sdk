
export class Slippage {
    amount: number;

    constructor(slip: number, isPercent: boolean) {
        this.amount = isPercent ? slip : slip / 100;
    }

    inBps() {
        return this.amount * 10000;
    }
}