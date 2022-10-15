import {BigNumber, ethers} from 'ethers';
import { IERC20Token, OrderType, SDKError, units } from '../../common';
import { Slippage } from '../../common/Slippage';
import {AllowedFiltersByNetwork, DexFilters, MarketingProps, MarketingUtils, validateFilters} from '../../extras';
import { QuoteRequest } from '../../services/quote/QuoteService';
import {IAlgo} from '../../algos';
import { TokenLookup } from '../../services';
import { IQuoteResponse } from '../interfaces';

//min allowed slippage is 50bps
export const MIN_SLIPPAGE = new Slippage(.05, false);

export interface ICustomizations {
    maxGasPriceGwei?: number;
    maxNumberRounds?: number;
    expiration?: Date;
    dexFilters?: DexFilters;
}

export interface BaseSwapConfig {
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    amountIn: BigNumber;
    slippage: Slippage;
    customizations?: ICustomizations;
}

export interface IValidationContext {
    signer: ethers.Signer;
    marketing?: MarketingProps;
    quote: IQuoteResponse;
}


export abstract class BaseSwap {
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    amountIn: BigNumber;
    //either provide slippage or an exact minimum output amount
    slippage: Slippage;
    customizations?: ICustomizations;
    swapType: OrderType;

    constructor(props: BaseSwapConfig, sType: OrderType) {
        this.tokenIn = props.tokenIn;
        this.tokenOut = props.tokenOut;
        this.amountIn = props.amountIn;
        this.slippage = props.slippage;
        this.customizations = props.customizations;
        this.swapType = sType;
    }

    toQuoteRequest(): QuoteRequest {

        let maxFixedGas: BigNumber | undefined = undefined;
        let minOrderSize: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }
        if(this.customizations?.maxNumberRounds) {
            minOrderSize = this.amountIn.div(this.customizations.maxNumberRounds);
        }
        if(this.customizations?.dexFilters) {
            validateFilters(this.tokenIn.chainId, this.customizations.dexFilters);
        }
        return {
            amountIn: this.amountIn,
            chainId: this.tokenIn.chainId,
            slippagePercent: this.slippage ? this.slippage.amount : MIN_SLIPPAGE.amount,
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            dexFilters: this.customizations?.dexFilters,
            maxFixedGas,
            minOrderSize
        } as QuoteRequest;
    }

    abstract toAlgo(): IAlgo;
    
    async validate(ctx: IValidationContext): Promise<string | undefined> {
        const algo = this.toAlgo();
        const r = algo.verify();
        if(r) {
            throw new SDKError({
                message: r
            })
        }
        if(!ctx.quote) {
            throw new SDKError({
                message: "Must have a quote to send a swap request"
            });
        }

        const trader = await ctx.signer.getAddress();
        
        const info = await TokenLookup.getInfo(this.tokenIn, trader);
        if(!info) {
            return "No balance or approval info available for trader";
        }
        if(info.balance?.lt(this.amountIn)) {
            return "Insufficient input token balance";
        }
        if(info.allowance?.lt(this.amountIn)) {
            return "Insufficient spend approval";
        }
        if(this.customizations?.dexFilters) {
            if( this.customizations.dexFilters.include &&
                this.customizations.dexFilters.include.length > 0 &&
                this.customizations.dexFilters.exclude &&
                this.customizations.dexFilters.exclude.length > 0
            ) {
                return "Must have an include or exclude list for filters, but not both"
            }
            validateFilters(this.tokenIn.chainId, this.customizations.dexFilters);
        }
        if(!this.slippage) {
            return "Missing slippage percentage";
        }
        if(ctx.marketing) {
            MarketingUtils.extractMarketingProps(ctx.marketing);
        }
    }

    async serialize(ctx: IValidationContext): Promise<object> {
        const e = await this.validate(ctx);
        if(e) {
            throw new SDKError({
                message: e
            });
        }

        const algo = this.toAlgo();
        const algoSer = algo.serialize() as any;
        return {
            algorithm: algoSer.algorithm,
            amountIn: this.amountIn.toString(),
            marketing: ctx.marketing,
            dexFilters: this.customizations?.dexFilters,
            networkId: this.tokenIn.chainId,
            policies: algoSer.policies,
            quoteId: ctx.quote.id,
            tokenIn: this.tokenIn.address,
            tokenOut: this.tokenOut.address,
        }
    }
}