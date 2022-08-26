import {QuoteGrabber,QuoteRequest} from 'dexible-quote';
import {
    APIClient,
    APIExtensionProps,
    MarketingProps,
    Token,
    DexFilters
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
    dexFilters?: DexFilters;
}

export interface SpotParams {
    // chainId?: number;
    tokenIn: Token;
    tokenOut: Token;
}

export class QuoteExtension {
    api:  APIClient;
    marketing?: MarketingProps;
    chainId: number;

    constructor(props: APIExtensionProps) {
        this.api = props.apiClient;
        this.chainId = props.chainId;
        this.marketing = props.marketing;
    }

    async getQuote(props:QuoteParams) {
        let minAmount = BigNumber.from(-1);
        if(props.maxRounds) {
            minAmount = props.amountIn.div(props.maxRounds);
            if(minAmount.lt(1)) {
                minAmount = props.amountIn.mul(30).div(100);
            }
        }
        
        const req : QuoteRequest = {
            chainId: this.chainId,
            tokenIn: props.tokenIn,
            tokenOut: props.tokenOut,
            amountIn: props.amountIn.toString(),
            slippagePercent: props.slippagePercent,
            apiClient: this.api,
            maxFixedGas: props.maxFixedGas,
            fixedPrice: props.fixedPrice,
            minOrderSize: minAmount.toString(),
            marketing: this.marketing,
            dexFilters: props.dexFilters
        };
        return QuoteGrabber(req);
    }

    async getSpot(props:SpotParams) {

        const tokenIn = props.tokenIn.address.toLowerCase();
        const tokenOut = props.tokenOut.address.toLowerCase();

        // TODO: switch to generic endpoint to support single multi-chain api
        // const chainId = props.chainId || this.chainId;
        // const endpoint = `quotes/spot`;

        const endpoint = `quotes/spot/${encodeURIComponent(tokenIn)}/${encodeURIComponent(tokenOut)}`;
        
        return this.api.get({
            endpoint,
            // params: {
            //     tokenIn,
            //     tokenOut,
            //     chainId,
            // },
            requiresAuthentication: false,
            withRetrySupport: true,
        });



    }
}
