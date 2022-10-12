import { IBaseSwap } from "./IBaseSwap";
import { BigNumber } from "ethers";
import { IERC20Token } from "../../common";
import { TxnStatus } from "../../common/TxnStatus";
import { ExecutionStatus } from "../../common/ExecutionStatus";

export interface IQuoteResponse {
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
    rate: number;
}

export interface ITxnDetails {
    hash: string;
    status: TxnStatus;
    gasUsed: number;
    gasCost: BigNumber;
}

export interface ISwapResult {
    id: number;
    status: ExecutionStatus;
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    cummulativeInput: BigNumber;
    cummulativeOutput: BigNumber;
    totalInput: BigNumber;
    progress: number;
    cummulativeGasFee: BigNumber;
    feeToken: IERC20Token;
    cummulativeBpsFee: BigNumber;
    transactions: Array<ITxnDetails>;
}

export interface ITokenSupportResponse {
    supported: boolean;
    reason?: string;
}

export interface ITokenExchange {
    quote<T extends IBaseSwap>(swapType: T): Promise<IQuoteResponse>;
    spotRate(request: ISpotRequest): Promise<ISpotResponse>;
    swap<T extends IBaseSwap>(request: T): Promise<ISwapResult>;
    status(id: number): Promise<ISwapResult>;
    cancel(id: number): Promise<ISwapResult>;
    pause(id: number): Promise<ISwapResult>;
    resume(id: number): Promise<ISwapResult>;
    supportsToken(token: IERC20Token): Promise<ITokenSupportResponse>;
}