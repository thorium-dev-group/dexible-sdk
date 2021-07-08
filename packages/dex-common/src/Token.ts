import { BigNumber } from "ethers";

export default interface Token {
    address: string;
    decimals: number;
    symbol: string;
    name?: string;
    balance?: BigNumber;
    allowance?: BigNumber;
}