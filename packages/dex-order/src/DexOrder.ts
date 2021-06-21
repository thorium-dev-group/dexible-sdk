import {Token} from 'dex-token';
import { BigNumber, BigNumberish } from 'ethers';
import {IAlgo} from 'dex-algos';
import {ethers} from 'ethers';
import {QuoteGrabber, QuoteRequest} from 'dex-quote';
import {chainToName} from 'dex-common';
import { EthHttpSignatureAxiosAdapter } from 'dex-eth-http-signatures';
import { AxiosAdapter } from 'axios';

export interface VerificationResponse {
    error?:string;
    estimate:any; //for now
}

export interface DexParams {
    wallet: ethers.Wallet,
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumber;
    algo: IAlgo;
    fee: BigNumberish; //for future use
    network: string; //for future use
    chainId: number;
    maxRounds: number;
}

export default class DexOrder {
    wallet: ethers.Wallet;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumber;
    algo: IAlgo;
    fee: BigNumberish; //for future use
    quoteId: number;
    network: string; //for future use
    chainId: number;
    quote: any;
    maxRounds: number;
    adapter: AxiosAdapter;

    constructor(params:DexParams) {
        this.wallet = params.wallet;
        this.tokenIn = params.tokenIn;
        this.tokenOut = params.tokenOut;
        this.amountIn = params.amountIn;
        this.algo = params.algo;
        this.fee = params.fee;
        this.network = params.network;
        this.chainId = params.chainId;
        this.maxRounds = params.maxRounds;
        this.quoteId = 0;
        this.quote = null;
        this.adapter = EthHttpSignatureAxiosAdapter.build(this.wallet)
    }

    serialize = () => {
        if(!this.quoteId) {
            throw new Error("Must generateQuote before serializing order");
        }

        return {
            ...this.algo.serialize(),
            tokenIn: this.tokenIn.address,
            tokenOut: this.tokenOut.address,
            amountIn: this.amountIn.toString(),
            quoteId: this.quoteId,
            networkId: this.chainId
        }
    }

    generateQuote = async (slippagePercent:number) => {
        let minPerRound = this.amountIn.mul(30).div(100);
        if(this.maxRounds) {
            let units = ethers.utils.formatUnits(this.amountIn, this.tokenIn.decimals);
            let inUnits = ((units as unknown)as number) / this.maxRounds;
            minPerRound = ethers.utils.parseUnits(inUnits.toFixed(this.tokenIn.decimals), this.tokenIn.decimals);
        }
        let chainName = chainToName(this.network, this.chainId);

        let req = {
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            amountIn: this.amountIn,
            minOrderSize: minPerRound,
            network: this.network,
            chainId: this.chainId,
            chainName,
            slippagePercent,
            adapter: this.adapter
        } as QuoteRequest;

        let quotes = await QuoteGrabber(req);
        if(quotes && quotes.length > 0) {
            //quotes array should have single-round and recommended quotes
            let single = quotes[0];
            let best = null;
            if(quotes[1]) {
                best = quotes[1];
            }
            if(!best) {
                best = single;
            }
            //pick the recommended
            this.quoteId = best.id;
            this.quote = best;
        }
        return quotes;
    }

    estimateGas = async () => {

    }

    verify = async ():Promise<VerificationResponse>  => {
        return null as VerificationResponse;
    }
}