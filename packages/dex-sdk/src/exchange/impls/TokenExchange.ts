import { ExecutionStatus, IERC20Token, SDKError, units } from "../../common";
import { APIClientFactory } from "../../services/APIClientFactory";
import { BaseSwap, IValidationContext } from "../swap_types/BaseSwap";
import { IQuoteResponse, ISpotRequest, ISpotResponse, ISwapResult, ITokenExchange, ITokenSupportResponse } from "../interfaces/ITokenExchange";
import {QuoteService, OrderService, OrderServiceFactory, TokenLookup} from '../../services';
import { BigNumber, ethers } from "ethers";
import { MarketingProps } from "../../extras";
import Logger from '../../logger';

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

interface TxnDetails {
    hash: string;
    status: string;
    timestamp: number;
}

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

interface ExecutionDetails {
    policy: string;
    passed: boolean;
    reason: string;
    timestamp: number;
}

interface StatusChangeDetails {
    reason: string;
    old_status: string;
    new_status: string;
    timestamp: number;
}

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

const TTL = 60 * 1000;
const log = new Logger({
    component: "TokenExchange"
});

export class TokenExchange implements ITokenExchange {
    readonly quoteService: QuoteService = new QuoteService();
    quoteCache: {
        [k: string]: {
            quote: IQuoteResponse;
            timeout: number;
    }} = {};

    constructor(
        readonly signer?: ethers.Signer,
        readonly marketing?: MarketingProps
    ) {

    }

    async quote<T extends BaseSwap>(swapType: T): Promise<IQuoteResponse> {
        this._clearOldQuotes();
        const req = swapType.toQuoteRequest();
        const quotes = (await this.quoteService.getQuote(req)) as Array<RawQuoteDetails>;

        //second is "best" quote, first is single-round quote
        const r = quotes[1];
        log.info({
            msg: "Raw quote",
            quote: r
        });
        const q = {
            id: r.id,
            amountOut: BigNumber.from(r.minNetOutput),
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

    async spotRate(request: ISpotRequest): Promise<ISpotResponse> {
        const client = APIClientFactory.instance.getClient(request.baseToken.chainId);
        const tokenIn = request.baseToken.address.toLowerCase();
        const tokenOut = request.quoteToken.address.toLowerCase();

        const endpoint = `quotes/spot/${encodeURIComponent(tokenIn)}/${encodeURIComponent(tokenOut)}`;
        
        const p = await client.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: true,
        });
        return p;
    }

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
        const ser = await request.serialize(ctx);
        const client = APIClientFactory.instance.getClient(request.tokenIn.chainId);
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
        return this.status(`${request.tokenIn.chainId}:${r.id}`);
    }


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

    async cancel(id: string): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }

    async pause(id: string): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
    }

    async resume(id: string): Promise<ISwapResult> {
        throw new Error("Method not implemented.");
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