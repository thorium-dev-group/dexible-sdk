import Token from './Token';
import { BigNumber, ethers } from 'ethers';

/**
 * This class simplifies and clarifies the expression of prices. It 
 * allows more explicit price defintions in terms of input/output 
 * tokens and amounts. 
 */

const asDecs = ethers.utils.formatUnits;
const asUnits = ethers.utils.parseUnits;
const bn = ethers.BigNumber.from;

export interface PriceUnits {
    inToken: Token;
    outToken: Token;
    inUnits: number;
    outUnits: number;
}

export interface PriceUSD {
    token: Token;
    price: BigNumber;
}

export interface BigNumberPrice {
    inToken: Token;
    outToken: Token;
    inAmount: BigNumber;
    outAmount: BigNumber;

    // USD Pricing Support
    isUSD?: boolean;
    usdPrice?: BigNumber;
    usdPricedToken?: Token;    
}

export default class Price {
    inToken: Token;
    outToken: Token;
    inAmount: BigNumber;
    outAmount: BigNumber;
    rate: number;

    // USD Pricing Support
    isUSD: boolean;
    usdPrice: BigNumber | undefined;
    usdPricedToken: Token | undefined;
    
    static unitsToPrice(props:PriceUnits) {
        const {
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

    static usdToPrice(props: PriceUSD) {
        const {
            price,
            token,
        } = props;

        //for usd prices, the in/out token and amounts are ignored
        return new Price({
            inToken: {
                address: ethers.constants.AddressZero,
                decimals: 0,
                symbol: "NONE"
            } as Token,
            outToken: {
                address: ethers.constants.AddressZero,
                decimals: 0,
                symbol: "NONE"
            } as Token,
            inAmount: bn(1),
            outAmount: bn(1),
            isUSD: true,
            usdPrice: price,
            usdPricedToken: token,
        });
    }

    constructor(props: BigNumberPrice) {
        this.inToken = props.inToken;
        this.outToken = props.outToken;
        this.inAmount = props.inAmount;
        this.outAmount = props.outAmount;

        // USD Pricing Support
        this.isUSD = props.isUSD || false;
        this.usdPrice = props.usdPrice;
        this.usdPricedToken = props.usdPricedToken;

        let inUnits = +asDecs(this.inAmount, this.inToken.decimals);
        let outUnits = +asDecs(this.outAmount, this.outToken.decimals);
        this.rate = outUnits/inUnits;

    }

    inverse = ():Price => {
        return new Price({
            inToken: this.outToken,
            outToken: this.inToken,
            inAmount: this.outAmount,
            outAmount: this.inAmount,
            // TODO: ... is this the correct behavior for a usd token?
            isUSD: this.isUSD,
            usdPricedToken: this.usdPricedToken,
            usdPrice: this.usdPrice,
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
            outAmount,
            usdPricedToken,
            isUSD,
            usdPrice,
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
            outAmount: outAmount.toString(),

            isUSD: isUSD,
            usdPricedToken: usdPricedToken
                ? {
                    address: usdPricedToken.address,
                    symbol: usdPricedToken.symbol,
                    decimals: usdPricedToken.decimals    
                }
                : undefined,
            usdPrice: usdPrice?.toString(),
        }
    }
}
