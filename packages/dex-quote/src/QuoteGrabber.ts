import { BigNumberish } from '@ethersproject/bignumber';
import Logger from 'dexible-logger';
import {
    MarketingProps,
    Services, 
    Token
} from 'dexible-common';

const log = new Logger({
    component: "QuoteGrabber"
})

export interface QuoteRequest {
    // TODO: discuss with @mdcoon
    chainId: number;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    slippagePercent: number;
    minOrderSize?:BigNumberish;
    apiClient: Services.APIClient;
    maxFixedGas?: BigNumberish;
    fixedPrice?: number;
    marketing?: MarketingProps;
}

export default async (request: QuoteRequest): Promise<any> => {
    const slippagePercentage = request.slippagePercent/100;

    const quoteBody = {
        amountIn: request.amountIn.toString(),
        networkId: request.chainId,
        tokenIn: request.tokenIn.address,
        tokenOut: request.tokenOut.address,
        minOrderSize: request.minOrderSize,
        maxFixedGas: request.maxFixedGas,
        fixedPrice: request.fixedPrice,
        slippagePercentage,
        marketing: request.marketing
    };

    let r = await request.apiClient.post({
        data: quoteBody,
        endpoint: "/quotes/public", 
        requiresAuthentication: false,
        withRetrySupport: true,
    });

    if(!r) {
        throw new Error("No data in response");
    }
    return r;
}
