import * as OrderSupport from 'dexible-order';
import {Services, Tag, Token} from 'dexible-common';
import { BigNumberish, ethers } from 'ethers';
import { IAlgo } from 'dexible-algos';

export interface OrderSpec {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    algo: IAlgo;
    tags?: Array<Tag>
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
            algo: params.algo,
            tags: params.tags
        });
        return order.prepare();
    }

    getAll = async (params:OrderListParams): Promise<Array<any>> => {
        return this.apiClient.get(`orders?limit=${params.limit?params.limit:100}&offset=${params.offset?params.offset:0}&state=${params.state?params.state:'all'}`)
    }

    getOne = async (id:number): Promise<any> => {
        return this.apiClient.get(`orders/${id}`);
    }

    cancel = async (orderId:number): Promise<any> => {
        return this.apiClient.post(`orders/${orderId}/actions/cancel`, {orderId});
    }

    pause = async (orderId:number): Promise<any> => {
        return this.apiClient.post(`orders/${orderId}/actions/pause`, {orderId});
    }

    resume = async (orderId:number): Promise<any> => {
        return this.apiClient.post(`orders/${orderId}/actions/resume`, {orderId});
    }
}