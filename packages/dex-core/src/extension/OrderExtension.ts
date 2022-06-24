import * as OrderSupport from 'dexible-order';
import {
    APIClient,
    APIExtensionProps,
    MarketingProps,
    Tag, 
    Token,
} from 'dexible-common';
import { BigNumberish } from 'ethers';
import { IAlgo } from 'dexible-algos';

export interface OrderSpec {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    quoteId?: number;
    algo: IAlgo;
    tags?: Array<Tag>;
}

export interface OrderListParams {
    limit?: number;
    offset?: number;
    state?: "all" | "active" | 'delegated';
}

export class OrderExtension {

    apiClient: APIClient;
    chainId: number;
    gnosisSafe?: string;
    marketing?: MarketingProps;

    constructor(props: APIExtensionProps) {
        this.apiClient = props.apiClient;
        this.chainId = props.chainId;
        this.gnosisSafe = props.gnosisSafe;
        this.marketing = props.marketing;
    }

    async prepare(params: OrderSpec): Promise<OrderSupport.PrepareResponse> {
        let order = new OrderSupport.DexOrder({
            apiClient: this.apiClient,
            chainId: this.chainId,
            quoteId: params.quoteId,
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            amountIn: params.amountIn,
            maxRounds: params.algo.maxRounds(),
            algo: params.algo,
            tags: params.tags,
            gnosisSafe: this.gnosisSafe,
            marketing: this.marketing,
        });
        return order.prepare();
    }

    async getAll(params:OrderListParams): Promise<Array<any>> {
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

    async getOne(id:number): Promise<any> {
        return this.apiClient.get(`orders/${id}`);
    }

    async cancel(orderId:number): Promise<any> {
        return this.apiClient.post(`orders/${orderId}/actions/cancel`, {orderId});
    }

    async pause(orderId:number): Promise<any> {
        return this.apiClient.post(`orders/${orderId}/actions/pause`, {orderId});
    }

    async resume(orderId:number): Promise<any> {
        return this.apiClient.post(`orders/${orderId}/actions/resume`, {orderId});
    }
}
