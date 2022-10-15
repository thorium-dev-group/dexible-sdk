import { BigNumber } from "ethers";
import { IERC20Token } from "../../common";
import { DexFilters, MarketingProps } from "../../extras";
import {IAlgo} from '../../algos';
import { APIClientFactory } from "../APIClientFactory";
import { APIClient } from "../../client";

export interface IOrderParams {
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    quoteId?: number;
    amountIn: BigNumber;
    algo: IAlgo;
    maxRounds: number;
    gnosisSafe?: string;
    marketing?: MarketingProps;
    dexFilters?: DexFilters;
}


export interface OrderListParams {
    limit?: number;
    offset?: number;
    state?: "all" | "active" | 'delegated';
}

export class OrderService {
    constructor(
        readonly chainId: number
    ) {  }

    async submitOrder(params: IOrderParams): Promise<any> {

        const algoSer = params.algo.serialize() as any;
        const ser = {
            algorithm: algoSer.algorithm,
            amountIn: params.amountIn.toString(),
            gnosisSafe: params.gnosisSafe,
            marketing: params.marketing,
            dexFilters: params.dexFilters,
            networkId: this.chainId,
            policies: algoSer.policies,
            quoteId: params.quoteId,
            tokenIn: params.tokenIn.address,
            tokenOut: params.tokenOut.address,
        }

        const apiClient = APIClientFactory.instance.getClient(this.chainId);

        const r = apiClient.post({
            endpoint: "orders", 
            data: ser,
            requiresAuthentication: true,
            withRetrySupport: false,
        });

        return r;
    }


    async getAll(params:OrderListParams): Promise<Array<any>> {
        const apiClient = APIClientFactory.instance.getClient(this.chainId);

        const r = await apiClient.get({
            endpoint: 'orders',
            requiresAuthentication: true,
            withRetrySupport: true,
            params
        });
        return r;
    }

    async getOne(id:number): Promise<any> {
        const apiClient = APIClientFactory.instance.getClient(this.chainId);

        const r = await apiClient.get({
            endpoint: `orders/${id}`,
            requiresAuthentication: true,
            withRetrySupport: true,
        });
        return r;
    }

    async cancel(orderId:number): Promise<any> {
        const apiClient = APIClientFactory.instance.getClient(this.chainId)

        return apiClient.post({
            data: {orderId},
            endpoint: `orders/${orderId}/actions/cancel`,
            requiresAuthentication: true,
            withRetrySupport: true,
        });
    }

    async pause(orderId:number): Promise<any> {
        const apiClient = APIClientFactory.instance.getClient(this.chainId)

        return apiClient.post({
            data: {orderId},
            endpoint: `orders/${orderId}/actions/pause`,
            requiresAuthentication: true,
            withRetrySupport: true,
        });
    }

    async resume(orderId:number): Promise<any> {
        const apiClient = APIClientFactory.instance.getClient(this.chainId)

        return apiClient.post({
            data: {orderId},
            endpoint: `orders/${orderId}/actions/resume`,
            requiresAuthentication: true,
            withRetrySupport: true,
        });
    }
}