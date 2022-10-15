import { BaseSwap } from "../swap_types/BaseSwap";
import { BigNumber } from "ethers";
import { IERC20Token } from "../../common";
import { TxnStatus } from "../../common/TxnStatus";
import { ExecutionStatus } from "../../common/ExecutionStatus";

export interface IQuoteResponse {
    id: string | number;
    amountOut: BigNumber;
    rounds: number;
    bpsFee: BigNumber;
    feeToken: IERC20Token;
    totalEstimatedGasFees: BigNumber;
}

export interface ISpotRequest {
    baseToken: IERC20Token;
    quoteToken: IERC20Token;
    amountIn?: BigNumber;
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


export interface ITokenExchange {
    quote<T extends BaseSwap>(swapType: T): Promise<IQuoteResponse>;
    spotRate(request: ISpotRequest): Promise<ISpotResponse>;
    swap<T extends BaseSwap>(request: T): Promise<ISwapResult>;
    supportsToken(token: IERC20Token): Promise<ITokenSupportResponse>;
    status(id: string): Promise<ISwapResult>;
    cancel(id:string): Promise<ISwapResult>;
    pause(id: string): Promise<ISwapResult>;
    resume(id: string): Promise<ISwapResult>;
}