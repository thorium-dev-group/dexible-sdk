
export class Slippage {
    amount: number;

    constructor(slip: number, isPercent: boolean) {
        this.amount = isPercent ? slip : slip / 100;
    }

    //1/100th of 1% (.01 / 100 == .0001). 1% would return 100bps
    inBps() {
        return this.amount * 10000;
    }

    //if .01 is stored amount, 1 is returned
    asPercentage() {
        return this.amount * 100;
    }
}