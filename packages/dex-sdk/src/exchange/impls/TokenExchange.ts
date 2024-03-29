import { ExecutionStatus, IERC20Token, SDKError } from "../../common";
import { APIClientFactory } from "../../services/APIClientFactory";
import { BaseSwap, IValidationContext } from "../swap_types/BaseSwap";
import { IQuoteResponse, ISpotRequest, ISpotResponse, ISwapResult, ITokenExchange, ITokenSupportResponse } from "../interfaces/ITokenExchange";
import {QuoteService, OrderServiceFactory, TokenLookup} from '../../services';
import { BigNumber, ethers } from "ethers";
import { MarketingProps } from "../../extras";
import Logger from '../../logger';

/**
 * Quotes are returned in this format from API
 */
interface RawQuoteDetails {
    id: string | number;
    tokenIn: string;
    tokenOut: string;
    amountInPerRound: string;
    amountOutPerRound: string;
    maxNetOutput: string;
    maxGrossOutput: string;
    minNetOutput: string;
    minGrossOutput: string;
    networkId: number;
    feeToken: string;
    rounds: number;
    totalFees: string;
    gasFee: string;
    dexibleFee: string;
    price: number;
    guaranteedPrice: number;
    sources: string[];
    expires: string;
}

/**
 * Txn details included in swap txns
 */
interface TxnDetails {
    hash: string;
    status: string;
    timestamp: number;
}

/**
 * Swap fill summary details
 */
interface FillSummaryDetails {
    fail_count: number;
    fees: string;
    gas_fees: string;
    fee_token: string;
    total_attempts: number;
    tokens_spent: string;
    tokens_received: string;
    progress: number;
    has_pending_txn: boolean;
    txns: Array<TxnDetails>;
}

/**
 * Every policy attached to a swap order is evaluated and when the 
 * evaluation status changes, the changes are captured in this structure
 */
interface ExecutionDetails {
    policy: string;
    passed: boolean;
    reason: string;
    timestamp: number;
}

/**
 * If a swap order's status changes, the change is captured with these details.
 */
interface StatusChangeDetails {
    reason: string;
    old_status: string;
    new_status: string;
    timestamp: number;
}

/**
 * The raw format for swap orders returned by the API
 */
interface RawOrderDetails {
    id: number;
    state: string;
    token_in: string;
    token_out: string;
    amount_in: string;
    network_id: number;
    affiliate_id: string;
    affiliate_percent: string;
    bps_rate: string; //decimal number though
    quote_id: number;
    createdAt: number;
    algo: object;
    policies: Array<object>;
    dex_filters: Array<string>;
    quote: object;
    fill_summary: FillSummaryDetails;
    execution_status: Array<ExecutionDetails>;
    status_changes: Array<StatusChangeDetails>;
}

//how long to cache quotes
const TTL = 60 * 1000;
const log = new Logger({
    component: "TokenExchange"
});

/**
 * The TokenExchange class is the entry point for interacting with Dexible's 
 * swapping capabilities. You should access this through the Dexible.exchange
 * property.
 */
export class TokenExchange implements ITokenExchange {
    //service used to generate quotes
    readonly quoteService: QuoteService = new QuoteService();

    //short-term cache for quote history
    quoteCache: {
        [k: string]: {
            quote: IQuoteResponse;
            timeout: number;
    }} = {};

    constructor(
        readonly signer?: ethers.Signer,
        readonly marketing?: MarketingProps
    ) {  }

    /**
     * Get a quote for the given swap order type.
     * 
     * @param swapType 
     * @returns 
     */
    async quote<T extends BaseSwap>(swapType: T): Promise<IQuoteResponse> {
        this._clearOldQuotes();
        const req = swapType.toQuoteRequest();
        if(!req) {
            throw new SDKError({
                message: "Problem generated quote request"
            });
        }

        log.debug({
            msg: "Submitting quote request",
            chainId: swapType.tokenIn.chainId,
            tokenIn: swapType.tokenIn.symbol,
            tokenOut: swapType.tokenOut.symbol,
            amountIn: swapType.amountIn.toString()
        });
        const quotes = (await this.quoteService.getQuote(req)) as Array<RawQuoteDetails>;
        if(quotes.length === 0) {
            throw  new SDKError({
                message: "No quotes generated by API"
            });
        }

        //second is "best" quote, first is single-round quote
        const r = quotes[1] || quotes[0];
        if(!r) {
            throw new SDKError({
                message: "no quotes generated by API"
            });
        }

        log.debug({
            msg: "Best quote",
            quote: r
        });

        const q = {
            id: r.id,
            minAmountOut: BigNumber.from(r.minNetOutput),
            maxAmountOut: BigNumber.from(r.maxNetOutput),
            bpsFee: BigNumber.from(r.dexibleFee),
            feeToken: (r.feeToken.toLowerCase() === req.tokenIn.address.toLowerCase() ? req.tokenIn : req.tokenOut),
            rounds: r.rounds,
            totalEstimatedGasFees: BigNumber.from(r.gasFee)
        } as IQuoteResponse;
        
        const key = this._generateQuoteKey(swapType);
        this.quoteCache[key] = {
            quote: q,
            timeout: Date.now() + TTL
        };
        return q;
    }

    /**
     * Get a spot rate for a token pair. 
     * 
     * @param request 
     * @returns 
     */
    async spotRate(request: ISpotRequest): Promise<ISpotResponse> {
        log.debug({
            msg: "Getting spot rate for tokens",
            baseToken: request.baseToken.symbol,
            quoteToken: request.quoteToken.symbol
        });

        const client = APIClientFactory.instance.getClient(request.baseToken.chainId);
        const tokenIn = request.baseToken.address.toLowerCase();
        const tokenOut = request.quoteToken.address.toLowerCase();

        const endpoint = `quotes/spot/${encodeURIComponent(tokenIn)}/${encodeURIComponent(tokenOut)}`;
        
        const p = await client.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: true,
        });
        if(!p || !p.price) {
            throw new SDKError({
                message: "No spot price generated for token pair"
            });
        }

        log.debug({
            msg: "Spot rate retrieved",
            price: p.price
        });
        return p;
    }

    /**
     * Submit a Dexible swap. This will record swap details in Dexible's
     * database and an evaluation cycle will submit on-chain if all
     * swap conditions/policies are met.
     * 
     * @param request 
     * @returns 
     */
    async swap<T extends BaseSwap>(request: T): Promise<ISwapResult> {
        const qKey = this._generateQuoteKey(request);
        const e = this.quoteCache[qKey];
        let q: IQuoteResponse;
        if(e && e.timeout > Date.now()) {
            q = e.quote;
        } else {
            q = await this.quote(request);
        }
        if(!this.signer) {
            throw new SDKError({
                message: "Must provide a signer to submit swap requests"
            });
        }

        const ctx:IValidationContext = {
            signer: this.signer,
            marketing: this.marketing,
            quote: q
        };
        log.debug({
            msg: "Validating and serializing swap details",
            tokenIn: request.tokenIn.symbol,
            tokenOut: request.tokenOut.symbol
        });
        const ser = await request.serialize(ctx);
        const client = APIClientFactory.instance.getClient(request.tokenIn.chainId);
        log.debug({
            msg: "Submitting swap details to Dexible API"
        });
        const r = (await client.post({
            endpoint: "orders", 
            data: ser,
            requiresAuthentication: true,
            withRetrySupport: false,
        })) as RawOrderDetails;
        if(!r) {
            throw new SDKError({
                message: "Order details not returned from server"
            });
        }
        const oid = `${request.tokenIn.chainId}:${r.id}`;
        log.debug({
            msg: "Order submitted, retrieving status",
            swap_id: oid
        });
        return await this.status(oid);
    }

    /**
     * Check whether Dexible supports the given token. Supported tokens 
     * must be accessible on CoinGecko
     * 
     * @param token 
     * @returns 
     */
    async supportsToken(token: IERC20Token): Promise<ITokenSupportResponse> {
        const client = APIClientFactory.instance.getClient(token.chainId);
        const endpoint = `token/verify/${token.chainId}/${token.address}`;

        try {
            const ok = await client.get({
                endpoint,
                requiresAuthentication: false,
                withRetrySupport: true,
            });
            return {
                supported: !!ok
            }
        } catch (e:any) {
            return {
                supported: false,
                reason: e.message
            }
        }
    }

    /**
     * Get the status of a specific order.
     * 
     * @param id 
     * @returns 
     */
    async status(id: string): Promise<ISwapResult> {
       
        const [chainId, oid] = id.split(":");
        if(!chainId || !oid) {
            throw new SDKError({
                message: "Invalid order ID string"
            });
        }

        const orderService = OrderServiceFactory.instance.getOrderService(+chainId);
        const o = (await orderService.getOne(+oid)) as RawOrderDetails;
        
        if(!o) {
            throw new SDKError({
                message: `No order found on network ${chainId} with id ${oid}`
            });
        }
        return this._convertToSwapResult(o, id);
        
    }

    /**
     * Get page of active and historical swaps
     * 
     * @param chainId 
     * @param offset 
     * @param pageSize 
     * @returns 
     */
    async allSwaps(chainId: number, offset: number = 0, pageSize: number = 100): Promise<ISwapResult[]> {
        const orderService = OrderServiceFactory.instance.getOrderService(+chainId);
        const hits = await orderService.getAll({
            limit: pageSize,
            offset
        });
        const res:ISwapResult[] = [];
        for(let i=0;i<hits.length;++i) {
            const h = hits[i];
            const id = `${chainId}:${h.id}`;
            res.push(await this._convertToSwapResult(h as RawOrderDetails, id));
        };
        return res;
    }

    /**
     * Cancel an active or paused order.
     * 
     * @param id 
     * @returns 
     */
    async cancel(id: string): Promise<ISwapResult> {
        const [chainId, oid] = id.split(":");
        if(!chainId || !oid) {
            throw new SDKError({
                message: "Invalid order ID string"
            });
        }

        const orderService = OrderServiceFactory.instance.getOrderService(+chainId);
        log.debug({
            msg: "Cancelling swap request",
            id,
        });
        await orderService.cancel(+oid);
        log.debug({
            msg: "Retrieving updated status",
            id
        });
        return await this.status(id);
    }

    /**
     * Pause an active swap order 
     * 
     * @param id 
     * @returns 
     */
    async pause(id: string): Promise<ISwapResult> {
        const [chainId, oid] = id.split(":");
        if(!chainId || !oid) {
            throw new SDKError({
                message: "Invalid order ID string"
            });
        }

        const orderService = OrderServiceFactory.instance.getOrderService(+chainId);
        log.debug({
            msg: "Pausing swap request",
            id,
        });
        await orderService.pause(+oid);
        log.debug({
            msg: "Retrieving updated status",
            id
        });
        return await this.status(id);
    }

    /**
     * Resume evaluation of a paused order
     * 
     * @param id 
     * @returns 
     */
    async resume(id: string): Promise<ISwapResult> {
        const [chainId, oid] = id.split(":");
        if(!chainId || !oid) {
            throw new SDKError({
                message: "Invalid order ID string"
            });
        }

        const orderService = OrderServiceFactory.instance.getOrderService(+chainId);
        log.debug({
            msg: "Resuming swap",
            id,
        });
        await orderService.resume(+oid);
        log.debug({
            msg: "Retrieving updated status",
            id
        });
        return await this.status(id);
    }


    private _generateQuoteKey<T extends BaseSwap>(swapType: T): string {
       return `${swapType.tokenIn.chainId}:${swapType.tokenIn.address}:${swapType.tokenOut.address}:${swapType.amountIn.toString()}`;
    }

    private _clearOldQuotes(): void {
        const keys = Object.keys(this.quoteCache);
        keys.forEach(k => {
            const e = this.quoteCache[k];
            if(e.timeout <= Date.now()) {
                delete this.quoteCache[k];
            }
        })
    }

    private async _convertToSwapResult(o: RawOrderDetails, id: string): Promise<ISwapResult> {
        const [chainId,] = id.split(":");
        const fs = o.fill_summary;
        return {
            cummulativeBpsFee: BigNumber.from(fs ? fs.fees : 0),
            cummulativeGasFee: BigNumber.from(fs ? fs.gas_fees : 0),
            cummulativeInput: BigNumber.from(fs ? fs.tokens_spent : 0),
            cummulativeOutput: BigNumber.from(fs ? fs.tokens_received : 0),
            feeToken: fs.fee_token ? await TokenLookup.getInfo({
                address: fs.fee_token, 
                chainId: +chainId,
                decimals: 0, //will resolve on lookup
            }): undefined,
            id,
            progress: fs.progress,
            status: o.state ? o.state : ExecutionStatus.PENDING,
            tokenIn: await TokenLookup.getInfo({
                address: o.token_in,
                chainId: +chainId,
                decimals: 0
            }),
            tokenOut: await TokenLookup.getInfo({
                address: o.token_out,
                chainId: +chainId,
                decimals: 0
            }),
            totalInput: BigNumber.from(o.amount_in),
            transactions: (fs && fs.txns.length > 0) ? fs.txns.map(t => ({
                hash: t.hash,
                status: t.status
            })) : []
        } as ISwapResult;
    }
}