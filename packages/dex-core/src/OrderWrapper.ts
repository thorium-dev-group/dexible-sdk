import * as OrderSupport from 'dexible-order';
import {Services, Tag, Token} from 'dexible-common';
import { BigNumberish, ethers } from 'ethers';
import { IAlgo } from 'dexible-algos';

export interface OrderSpec {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    algo: IAlgo;
    tags?: Array<Tag>;
}

export interface OrderListParams {
    limit?: number;
    offset?: number;
    state?: "all" | "active" | 'delegated';
}

export default class OrderWrapper {
    apiClient: Services.APIClient;
    gnosisSafe?: string;

    constructor(apiClient: Services.APIClient, gnosisSafe?: string) {
        this.apiClient = apiClient;
        this.gnosisSafe = gnosisSafe;
    }

    prepare = async (params: OrderSpec): Promise<OrderSupport.PrepareResponse> => {
        let order = new OrderSupport.DexOrder({
            apiClient: this.apiClient,
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            amountIn: params.amountIn,
            maxRounds: params.algo.maxRounds(),
            algo: params.algo,
            tags: params.tags,
            gnosisSafe: this.gnosisSafe
        });
        return order.prepare();
    }

    getAll = async (params:OrderListParams): Promise<Array<any>> => {
        let qs = Object.keys(params).reduce((s, k, i)=>{
            let v = params[k];
            if(typeof v !== 'undefined' && v !== null) {
                if(i > 0) {
                    s += `&${k}=${v}`;
                } else {
                    s += `${k}=${v}`;
                }
            }
            return s;
        }, "");
        if(this.gnosisSafe && this.gnosisSafe.length > 0) {
            qs += "&gnosisSafe=" + this.gnosisSafe;
        }
        return this.apiClient.get(`orders?${qs}`)
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