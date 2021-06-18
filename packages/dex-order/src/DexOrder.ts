import {Token} from 'dex-token';
import { BigNumberish } from 'ethers';
import {IAlgo} from 'dex-algos';

export interface VerificationResponse {
    error?:string;
    estimate:any; //for now
}

export default class DexOrder {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    algo: IAlgo;
    fee: BigNumberish; //for future use
    quoteId: number;
    network: string; //for future use
    chainId: number;

    serialize = () => {
        return {
            ...this.algo.serialize(),
            tokenIn: this.tokenIn.address,
            tokenOut: this.tokenOut.address,
            amountIn: this.amountIn.toString(),
            quoteId: this.quoteId,
            networkId: this.chainId
        }
    }

    estimateGas = async () => {

    }

    verify = async ():Promise<VerificationResponse>  => {
        return null as VerificationResponse;
    }
}