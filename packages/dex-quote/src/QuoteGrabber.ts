import { BigNumberish } from '@ethersproject/bignumber';
import axios, { AxiosAdapter } from 'axios';
import {Token} from 'dex-token';
import Logger from 'dex-logger';

const log = new Logger({
    component: "QuoteGrabber"
})

const DEFAULT_BASE_ENDPOINT = "api.dexible.io";

export interface QuoteRequest {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    slippagePercent: number;
    minOrderSize?:BigNumberish,
    network: string;
    chainId: number,
    chainName: string;
    adapter: AxiosAdapter; 
}

export default async (request: QuoteRequest): Promise<any> => {

    let urlBase = process.env.API_BASE_URL;
    if(!urlBase) {
        urlBase = `https://${request.network}.${request.chainName}.${DEFAULT_BASE_ENDPOINT}`;
    }
    let url = `${urlBase}/v1/quotes`;

    log.info("Sending quote request to", url);

    const quoteBody = {
        amountIn: request.amountIn.toString(),
        networkId: request.chainId,
        tokenIn: request.tokenIn.address,
        tokenOut: request.tokenOut.address,
        minOrderSize: request.minOrderSize,
        slippagePercentage: request.slippagePercent/100
    };

    let r = await axios.request({
        url,
        method: "post",
        adapter: request.adapter,
        data: quoteBody
    });

    if(!r) {
        throw new Error("No data in response");
    }

    if(r.data && r.data.error) {
        throw new Error(r.data.error);
    }
    return r.data;
}