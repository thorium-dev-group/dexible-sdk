import {QuoteGrabber,QuoteRequest} from 'dexible-quote';
import {
    APIClient,
    MarketingProps,
    Services, 
    Token,
} from 'dexible-common';
import { BigNumber, BigNumberish } from 'ethers';

export interface QuoteParams {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumber;
    slippagePercent: number;
    maxRounds?: number;
    maxFixedGas?: BigNumberish;
    fixedPrice?: number;
}

export interface SpotParams {
    tokenIn: Token;
    tokenOut: Token;
}

export default class QuoteWrapper {
    api:  APIClient;
    marketing?: MarketingProps;

    constructor(apiClient:Services.APIClient, marketing?: MarketingProps) {
        this.api = apiClient;
        this.marketing = marketing;
    }

    getQuote = async (props:QuoteParams) => {
        let minAmount = BigNumber.from(-1);
        if(props.maxRounds) {
            minAmount = props.amountIn.div(props.maxRounds);
            if(minAmount.lt(1)) {
                minAmount = props.amountIn.mul(30).div(100);
            }
        }
        
        const req : QuoteRequest = {
            tokenIn: props.tokenIn,
            tokenOut: props.tokenOut,
            amountIn: props.amountIn.toString(),
            slippagePercent: props.slippagePercent,
            apiClient: this.api,
            maxFixedGas: props.maxFixedGas,
            fixedPrice: props.fixedPrice,
            minOrderSize: minAmount.toString(),
            marketing: this.marketing,
        };
        return QuoteGrabber(req);
    }

    getSpot = async (props:SpotParams) => {
        const endpoint = `quotes/spot/${props.tokenIn.address.toLowerCase()}/${props.tokenOut.address.toLowerCase()}`;
        
        return this.api.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: true,
        });
    }
}
