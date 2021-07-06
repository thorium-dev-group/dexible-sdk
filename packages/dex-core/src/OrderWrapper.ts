import * as OrderSupport from 'dex-order';
import {Services} from 'dex-common';
import { BigNumberish, ethers } from 'ethers';
import {Token} from 'dex-token';
import { IAlgo } from 'dex-algos';

export interface OrderSpec {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    algo: IAlgo;

}

export interface OrderListParams {
    limit?: number;
    offset?: number;
    state?: "all" | "active";
}

export default class OrderWrapper {
    apiClient: Services.APIClient;

    constructor(apiClient: Services.APIClient) {
        this.apiClient = apiClient;
    }

    prepare = async (params: OrderSpec): Promise<OrderSupport.PrepareResponse> => {
        let order = new OrderSupport.DexOrder({
            apiClient: this.apiClient,
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            amountIn: params.amountIn,
            maxRounds: params.algo.maxRounds(),
            algo: params.algo
        });
        return order.prepare();
    }

    getAll = async (params:OrderListParams): Promise<Array<any>> => {
        return this.apiClient.get(`orders?limit=${params.limit?params.limit:100}&offset=${params.offset?params.offset:0}&state=${params.state?params.state:'all'}`)
    }
}