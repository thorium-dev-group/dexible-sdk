import { BigNumber, BigNumberish, ethers } from "ethers";

/**
 * Utilities for converting to/from BN's
 */

export const inBNUnits = (value: BigNumberish, u: number): BigNumber => {
    return ethers.utils.parseUnits(value.toString(), u);
}

export const inDecimalUnits = (value: BigNumberish, u: number): number => {
    return +ethers.utils.formatUnits(value, u);
}

export const inBNETH = (value: BigNumberish): BigNumber => {
    return inBNUnits(value, 18);
}

export const inDecimalETH = (value: BigNumberish): number => {
    return inDecimalUnits(value, 18);
}

export const units = {
    inBNETH,
    inDecimalUnits,
    inBNUnits,
    inDecimalETH
}