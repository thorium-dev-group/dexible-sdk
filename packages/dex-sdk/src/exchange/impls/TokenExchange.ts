import { ethers } from "ethers";
import { IERC20Token } from "../../common";
import { IBaseSwap } from "../interfaces/IBaseSwap";
import { IQuoteResponse, ISpotRequest, ISpotResponse, ISwapResult, ITokenExchange, ITokenSupportResponse } from "../interfaces/ITokenExchange";

export class TokenExchange implements ITokenExchange {
    
    quote<T extends IBaseSwap>(swapType: T): Promise<IQuoteResponse> {
        throw new Error("Method not implemented.");
    }
    spotRate(request: ISpotRequest): Promise<ISpotResponse> {
        throw new Error("Method not implemented.");
    }
    swap<T extends IBaseSwap>(request: T): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }
    status(id: number): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }
    cancel(id: number): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }
    pause(id: number): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }
    resume(id: number): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }
    supportsToken(token: IERC20Token): Promise<ITokenSupportResponse> {
        throw new Error("Method not implemented.");
    }

}