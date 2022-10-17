import {BigNumber, ethers} from 'ethers';
import { IERC20Token, SwapOrderType, SDKError, units } from '../../common';
import { Slippage } from '../../common/Slippage';
import {DexFilters, MarketingProps, MarketingUtils, validateFilters} from '../../extras';
import { QuoteRequest } from '../../services/quote/QuoteService';
import {IAlgo} from '../../algos';
import { TokenLookup } from '../../services';
import { IQuoteResponse } from '../interfaces';
import { GasCostPolicy, IPolicy, SlippagePolicy } from '../../policies';

//min allowed slippage is 50bps
export const MIN_SLIPPAGE = new Slippage(.05, false);

/**
 * Custom settings for swap requests
 */
export interface ICustomizations {

    //max gas willing to pay
    maxGasPriceGwei?: number;

    //max number of rounds for a large swap request
    maxNumberRounds?: number;

    //should the swap request expire after some time
    expiration?: Date;

    //only include or exclude certain DEXs in the execution
    dexFilters?: DexFilters;
}


/**
 * Basic configuratoin for all swap requests
 */
export interface BaseSwapConfig {

    //input token (selling)
    tokenIn: IERC20Token;

    //output token (buying)
    tokenOut: IERC20Token;

    //amount sold
    amountIn: BigNumber;

    //slippage factor if others move ahead of you
    slippage: Slippage;

    //any customizations for the request
    customizations?: ICustomizations;
}


//internal use for validating swap details
export interface IValidationContext {
    signer: ethers.Signer;
    marketing?: MarketingProps;
    quote: IQuoteResponse;
}


/**
 * Base class for swap requests
 */
export abstract class BaseSwap {
    tokenIn: IERC20Token;
    tokenOut: IERC20Token;
    amountIn: BigNumber;
    slippage: Slippage;
    customizations?: ICustomizations;
    swapType: string;

    constructor(props: BaseSwapConfig, sType: string) {
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
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }
        if(this.customizations?.maxNumberRounds && this.customizations.maxNumberRounds > 0) {
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

    protected _basePolicies(): IPolicy[] {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }
        
       return [
            (maxFixedGas ? 
                new GasCostPolicy({
                    gasType: 'fixed',
                    amount: maxFixedGas
                }) :
                new GasCostPolicy({
                    gasType: 'relative',
                    deviation: 0
                })),
                new SlippagePolicy({
                    amount: this.slippage? this.slippage.amount : MIN_SLIPPAGE.amount
                }),
        ];
    }
}