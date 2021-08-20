import {Algos, SDK, Token} from './';
import {BigNumberish, BigNumber, ethers} from 'ethers';
import Order, * as OrderSupport from './Order';

export interface Connection {
    walletKey?: string; 
    signer?: ethers.Signer;
    provider?: ethers.providers.Provider;
}

export interface SpendAllowance {
    token: Token;
    amount?: BigNumber;
    infinite?:boolean;
}

export interface TokenRequest {
    tokenIn: string;
    tokenOut: string;
}

export interface TokenResponse {
    tokenIn: Token;
    tokenOut: Token;
}

export interface QuoteRequest {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumber;
    maxRounds?: number;
    slippagePercent: number;
    maxFixedGas?: BigNumberish;
    minOrderSize?: BigNumberish;
}

export default class Dexible {

    static async connect(props:Connection):Promise<Dexible> {
        let signer = props.signer;
        if(!signer) {
            if(!props.walletKey) {
                throw new Error("If not providing a signer implementation, must supply a wallet key");
            }
            let p = props.provider;
            if(!p) {
                p = ethers.getDefaultProvider("homestead");
            }
            signer = new ethers.Wallet(props.walletKey, p);
        } else {
            let p = await signer.provider;
            if(!p) {
                throw new Error("If providing a Signer implementation, the signer must include a web3 provider");
            }
        }

        let sdk = await SDK.create({
            network: "ethereum",
            signer
        });
        return new Dexible(sdk);
    }

    sdk: SDK;

    private constructor(sdk:SDK) {
        this.sdk = sdk;
    }

    async resolveTokens(props:TokenRequest):Promise<TokenResponse> {
        let t1 = await this.sdk.token.lookup(props.tokenIn);
        let t2 = await this.sdk.token.lookup(props.tokenOut);
        return {tokenIn: t1, tokenOut: t2};
    }

    async getQuote(props:QuoteRequest):Promise<any> {
        return this.sdk.quote.getQuote(props);
    }

    async approve(props:SpendAllowance) {
        let a = props.amount;
        if(!a) {
            if(!props.infinite) {
                throw new Error("Must either provide a fixed spend allowance set the infinite flag for infinite approval");
            } else {
                a = ethers.constants.MaxInt256;
            }
        }
        return this.sdk.token.increaseSpending({
            amount: a,
            token: props.token
        });
    }


    async limit(props:OrderSupport.LimitProps) {
        return Order.create({
            ...props,
            sdk: this.sdk,
            type: Algos.types.Limit
        });
    }

    async market(props:OrderSupport.CommonProps) {
        return Order.create({
            ...props,
            sdk: this.sdk,
            type: Algos.types.Market
        });
    }

    async stopLoss(props:OrderSupport.StopLossProps) {
        return Order.create({
            ...props,
            sdk: this.sdk,
            type: Algos.types.StopLoss
        })
    }

    async twap(props:OrderSupport.TWAPProps) {
        return Order.create({
            ...props,
            sdk: this.sdk,
            type: Algos.types.TWAP
        });
    }
}