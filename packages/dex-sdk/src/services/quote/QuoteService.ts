import { BigNumber } from "ethers";
import { IERC20Token } from "../../common";
import { DexFilters } from "../../extras";
import { APIClientFactory } from "../APIClientFactory";


export interface QuoteRequest {
    chainId: number;
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    amountIn: BigNumber;
    slippagePercent: number;
    minOrderSize?:BigNumber;
    maxFixedGas?: BigNumber;
    fixedPrice?: number;
    dexFilters?: DexFilters;
}

export class QuoteService {

    async getQuote(request: QuoteRequest): Promise<any> {
        const quoteBody = {
            amountIn: request.amountIn.toString(),
            networkId: request.chainId,
            tokenIn: request.tokenIn.address,
            tokenOut: request.tokenOut.address,
            minOrderSize: request.minOrderSize,
            maxFixedGas: request.maxFixedGas,
            fixedPrice: request.fixedPrice,
            slippagePercentage: request.slippagePercent,
            dexFilters: request.dexFilters
        };
        const client = APIClientFactory.instance.getClient(request.tokenIn.chainId);
        let r = await client.post({
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
}