import {QuoteGrabber,QuoteRequest} from 'dexible-quote';
import {Services, Token} from 'dexible-common';
import { BigNumber, BigNumberish } from 'ethers';

export interface QuoteParams {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumber;
    slippagePercent: number;
    maxRounds?: number;
    maxFixedGas?: BigNumberish;
}
export default class QuoteWrapper {
    api: Services.APIClient;

    constructor(apiClient:Services.APIClient) {
        this.api = apiClient;
    }

    getQuote = async (props:QuoteParams) => {
        let minAmount = props.amountIn.mul(30).div(100);
        if(props.maxRounds) {
            minAmount = props.amountIn.div(props.maxRounds);
        }
        if(minAmount.lt(1)) {
            minAmount = props.amountIn.mul(30).div(100);
        }
        let req = {
            tokenIn: props.tokenIn,
            tokenOut: props.tokenOut,
            amountIn: props.amountIn.toString(),
            slippagePercent: props.slippagePercent,
            apiClient: this.api,
            maxFixedGas: props.maxFixedGas,
            minOrderSize: minAmount.toString()
        } as QuoteRequest;
        return QuoteGrabber(req);
    }
}