import { BaseSwap } from "../swap_types/BaseSwap";
import { BigNumber } from "ethers";
import { IERC20Token } from "../../common";
import { TxnStatus } from "../../common/TxnStatus";
import { ExecutionStatus } from "../../common/ExecutionStatus";

export interface IQuoteResponse {
    id: string | number;
    minAmountOut: BigNumber;
    maxAmountOut: BigNumber;
    rounds: number;
    bpsFee: BigNumber;
    feeToken: IERC20Token;
    totalEstimatedGasFees: BigNumber;
}

export interface ISpotRequest {
    baseToken: IERC20Token;
    quoteToken: IERC20Token;
}

export interface ISpotResponse {
    price: number;
}

export interface ITxnDetails {
    hash: string;
    status: TxnStatus;
}

export interface ISwapResult {
    id: string;
    status: ExecutionStatus;
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    cummulativeInput: BigNumber;
    cummulativeOutput: BigNumber;
    totalInput: BigNumber;
    progress: number;
    cummulativeGasFee: BigNumber;
    feeToken?: IERC20Token;
    cummulativeBpsFee: BigNumber;
    transactions: Array<ITxnDetails>;
}


export interface ITokenSupportResponse {
    supported: boolean;
    reason?: string;
}

/**
 * The TokenExchange class is the entry point for interacting with Dexible's 
 * swapping capabilities. You should access this through the Dexible.exchange
 * property.
 */
export interface ITokenExchange {
    /**
     * Get a quote for the given swap order type.
     * 
     * @param swapType 
     * @returns 
     */
    quote<T extends BaseSwap>(swapType: T): Promise<IQuoteResponse>;

    /**
     * Get a spot rate for a token pair. 
     * 
     * @param request 
     * @returns 
     */
    spotRate(request: ISpotRequest): Promise<ISpotResponse>;

    /**
     * Submit a Dexible swap. This will record swap details in Dexible's
     * database and an evaluation cycle will submit on-chain if all
     * swap conditions/policies are met.
     * 
     * @param request 
     * @returns 
     */
    swap<T extends BaseSwap>(request: T): Promise<ISwapResult>;

    /**
     * Check whether Dexible supports the given token. Supported tokens 
     * must be accessible on CoinGecko
     * 
     * @param token 
     * @returns 
     */
    supportsToken(token: IERC20Token): Promise<ITokenSupportResponse>;

    /**
     * Get the status of a specific order.
     * 
     * @param id 
     * @returns 
     */
    status(id: string): Promise<ISwapResult>;

    /**
     * Get a list of all swaps for a signer account. Use offset and page size 
     * for paging through results.
     * 
     * @param chainId
     * @param offset 
     * @param pageSize 
     */
    allSwaps(chainId: number, offset?: number, pageSize?: number): Promise<ISwapResult[]>;

    /**
     * Cancel an active or paused order.
     * 
     * @param id 
     * @returns 
     */
    cancel(id:string): Promise<ISwapResult>;

    /**
     * Pause an active swap order 
     * 
     * @param id 
     * @returns 
     */
    pause(id: string): Promise<ISwapResult>;

    /**
     * Resume evaluation of a paused order
     * 
     * @param id 
     * @returns 
     */
    resume(id: string): Promise<ISwapResult>;
}