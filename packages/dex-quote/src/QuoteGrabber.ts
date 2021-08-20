import { BigNumberish } from '@ethersproject/bignumber';
import Logger from 'dexible-logger';
import {Services, Token} from 'dexible-common';

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
}

export default async (request: QuoteRequest): Promise<any> => {
    let net = await request.apiClient.signer.provider?.getNetwork();
    if(!net) {
        throw new Error("Missing provider in web3 signer");
    }
    let chainId = net?.chainId;
    const quoteBody = {
        amountIn: request.amountIn.toString(),
        networkId: chainId-0,
        tokenIn: request.tokenIn.address,
        tokenOut: request.tokenOut.address,
        minOrderSize: request.minOrderSize,
        maxFixedGas: request.maxFixedGas,
        fixedPrice: request.fixedPrice,
        slippagePercentage: request.slippagePercent/100
    };

    let r = await request.apiClient.post("quotes", quoteBody);

    if(!r) {
        throw new Error("No data in response");
    }
    return r;
}