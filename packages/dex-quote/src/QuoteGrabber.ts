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
    let net = await request.apiClient.signer?.provider?.getNetwork();
    if(!net) {
        throw new Error("Missing provider in web3 signer");
    }
    
    const networkId = net?.chainId - 0;
    const slippagePercentage = request.slippagePercent/100;

    const quoteBody = {
        amountIn: request.amountIn.toString(),
        networkId,
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
        endpoint: "/quotes", 
        requiresAuthentication: false,
        withRetrySupport: true,
    });

    if(!r) {
        throw new Error("No data in response");
    }
    return r;
}
