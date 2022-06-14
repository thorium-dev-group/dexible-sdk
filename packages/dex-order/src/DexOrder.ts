import {BigNumberish } from 'ethers';
import {IAlgo} from 'dexible-algos';
import {ethers} from 'ethers';
import {QuoteGrabber, QuoteRequest} from 'dexible-quote';
import {
    MarketingProps,
    Services, 
    Tag, 
    Token
} from 'dexible-common';
import Logger from 'dexible-logger';

const bn = ethers.BigNumber.from;
const log = new Logger({component: "DexOrder"});

export interface PrepareResponse {
    error?:string;
    order?: DexOrder;
}

export interface DexOrderParams {
    apiClient: Services.APIClient;
    tokenIn: Token;
    tokenOut: Token;
    quoteId?: number;
    amountIn: BigNumberish;
    algo: IAlgo;
    maxRounds: number;
    tags?: Array<Tag>;
    gnosisSafe?: string;
    marketing?: MarketingProps;
}

export default class DexOrder {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    algo: IAlgo;
    fee: BigNumberish; //for future use
    quoteId: number;
    apiClient: Services.APIClient;
    quote: any;
    maxRounds: number;
    tags?: Array<Tag>;
    gnosisSafe?: string;
    marketing?: MarketingProps;

    constructor(params:DexOrderParams) {
        this.tokenIn = params.tokenIn;
        this.tokenOut = params.tokenOut;
        this.amountIn = params.amountIn;
        this.algo = params.algo;
        this.fee = "0"; //replaced by out-token BPS
        this.apiClient = params.apiClient;
        this.maxRounds = params.maxRounds;
        this.quoteId = params.quoteId || 0;
        this.quote = null;
        this.tags = params.tags;
        this.gnosisSafe = params.gnosisSafe;
        this.marketing = params.marketing;
    }

    serialize = () => {
        if(!this.quoteId) {
            throw new Error("No quote found to serialize order");
        }

        let algoSer = this.algo.serialize() as any;
        return {
            algorithm: algoSer.algorithm,
            amountIn: this.amountIn.toString(),
            gnosisSafe: this.gnosisSafe,
            marketing: this.marketing,
            networkId: this.apiClient.chainId,
            policies: algoSer.policies,
            quoteId: this.quoteId,
            tags: this.tags,
            tokenIn: this.tokenIn.address,
            tokenOut: this.tokenOut.address,
        }
    }

    verify = ():string|undefined => {
        if(!this.algo) {
            return "Order is missing algo";
        }

        //make sure all algos are good
        log.debug("Verifying algorithm properties...");
        let err = this.algo.verify();
        if(err) {
            log.error("Problem with algo", err);
            return err;
        }
        if(!this.quoteId) {
            log.error("Missing quote id");
            return "Must prepare order before submitting";
        }
        if(!this.tokenIn.balance) {
            log.error("Input token has no balance");
            return "Input token is missing a balance";
        }
        if(!this.tokenIn.allowance) {
            log.error("Input token has no allowance");
            return "Input token is missing allowance";
        }

        let bal = bn(this.tokenIn.balance);
        let allow = bn(this.tokenIn.allowance);

        let inAmt = bn(this.amountIn);
        if(bal.lt(inAmt)) {
            log.error("In token balance will not cover trade");
            return "Insufficient token balance for trade";
        }
        if(allow.lt(inAmt)) {
            log.error("Token allowance will not cover trade");
            return "Insufficient token allowance for trade";
        }

        log.debug("Surface-level order verification looks ok");
    }

    prepare = async (): Promise<PrepareResponse> => {
        
        log.debug("Preparing order for submission");
        let slippage = this.algo.getSlippage();
        if(!slippage) {
            return {
                error: "Missing slippage amount"
            }
        }

        try {
            
            if(!this.quote) {
                if(!this.quoteId) {
                    await this._generateQuote(slippage);
                } else {
                    await this._getQuote();
                }
            }
            
            let err = this.verify();
            if(err) {
                return {
                    error: err
                }
            }
            
            return {
                order: this
            }
        } catch (e) {
            return {
                error: e.message
            }
        } 
        
    }

    _generateQuote = async (slippagePercent:number) => {
        log.debug("Generating a default quote...");
        let minPerRound = bn(-1);
        if(this.maxRounds) {
            let units = ethers.utils.formatUnits(this.amountIn, this.tokenIn.decimals);
            let inUnits = ((units as unknown)as number) / this.maxRounds;
            minPerRound = ethers.utils.parseUnits(inUnits.toFixed(this.tokenIn.decimals), this.tokenIn.decimals);
        }

        let req = {
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            amountIn: this.amountIn.toString(),
            minOrderSize: minPerRound.toString(),
            apiClient: this.apiClient,
            slippagePercent,
        } as QuoteRequest;
        log.debug("Using request", req);

        let quotes = await QuoteGrabber(req);
        if(quotes && quotes.length > 0) {
            log.debug("Have quote result");
            //quotes array should have single-round and recommended quotes
            let single = quotes[0];
            let best:any = null;
            if(quotes[1]) {
                best = quotes[1];
            }
            if(!best) {
                best = single;
            }
            if(!best) {
                throw new Error("Could not generate a quote for order");
            }
            //pick the recommended
            this.quoteId = best.id;
            this.quote = best;
        } else {
            log.error("No quote returned from server");
            throw new Error("Could not generate quote for order");
        }
        return quotes;
    }

    _getQuote = async () => {
        try {
            this.quote = await this.apiClient.get(`quotes/${this.quoteId}`);
        } catch (e) {
            log.error("Could not get quote by id", e.message);
            throw e;
        }
    }

    submit = async () => {

        log.debug("Verifying order...");
        let err = this.verify();
        if(err) {
            log.error("Problem found during verification", err);
            throw new Error(err);
        }
        let ser = this.serialize();
        log.debug("Sending raw order details", ser);
        return this.apiClient.post("orders", ser);
    }

    toJSON() {
        return {
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            amountIn: this.amountIn.toString(),
            algo: this.algo,
            quoteId: this.quoteId,
            quote: this.quote,
            maxRounds: this.maxRounds,
            tags: this.tags,
            marketing: this.marketing || {},
        }
    }

}
