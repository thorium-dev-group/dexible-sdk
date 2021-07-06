import {Token} from 'dex-token';
import { BigNumber, ethers } from 'ethers';

/**
 * This class simplifies and clarifies the expression of prices. It 
 * allows more explicit price defintions in terms of input/output 
 * tokens and amounts. 
 */

const asDecs = ethers.utils.formatUnits;
const asUnits = ethers.utils.parseUnits;

export interface PriceUnits {
    inToken: Token;
    outToken: Token;
    inUnits: number;
    outUnits: number;
}

export interface BigNumberPrice {
    inToken: Token;
    outToken: Token;
    inAmount: BigNumber;
    outAmount: BigNumber;
}

export default class Price {
    inToken: Token;
    outToken: Token;
    inAmount: BigNumber;
    outAmount: BigNumber;
    rate: number;

    static unitsToPrice(props:PriceUnits) {
        let {
            inToken,
            outToken,
            inUnits,
            outUnits
        } = props;

        return new Price({
            inToken,
            outToken,
            inAmount: asUnits(inUnits.toFixed(inToken.decimals), inToken.decimals),
            outAmount: asUnits(outUnits.toFixed(outToken.decimals), outToken.decimals)
        });
    }

    constructor(props: BigNumberPrice) {
        this.inToken = props.inToken;
        this.outToken = props.outToken;
        this.inAmount = props.inAmount;
        this.outAmount = props.outAmount;

        let inUnits = +asDecs(this.inAmount, this.inToken.decimals);
        let outUnits = +asDecs(this.outAmount, this.outToken.decimals);
        this.rate = outUnits/inUnits;

    }

    inverse = ():Price => {
        return new Price({
            inToken: this.outToken,
            outToken: this.inToken,
            inAmount: this.outAmount,
            outAmount: this.inAmount
        });
    }

    toFixed = (digits: number): string => {
        return this.rate.toFixed(digits);
    }

    toString = () : string => {
        return this.rate.toFixed(Math.min(this.inToken.decimals, this.outToken.decimals));
    }

    toJSON = () : object => {
        let {
            inToken,
            outToken,
            inAmount,
            outAmount
        } = this;

        return {
            inToken: {
                address: inToken.address,
                symbol: inToken.symbol,
                decimals: inToken.decimals
            },
            outToken: {
                address: outToken.address,
                symbol: outToken.symbol,
                decimals: outToken.decimals
            },
            inAmount: inAmount.toString(),
            outAmount: outAmount.toString()
        }
    }
}