import { BigNumber } from "ethers";
import { OrderType, Price } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, IValidationContext, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, Limit } from "../../algos";
import { GasCostPolicy, LimitPricePolicy, SlippagePolicy } from "../../policies";
import { validateFilters } from "../../extras";

export interface LimitSwapConfig extends BaseSwapConfig {
    price: Price;
}
export class LimitSwap extends BaseSwap {
    price: Price;

    constructor(props: LimitSwapConfig) {
        super(props, OrderType.LIMIT);
        this.price = props.price;
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
            fixedPrice: this.price.rate,
            minOrderSize
        } as QuoteRequest;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }

        return new Limit({
            policies: [
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
                    amount: this.slippage.asPercentage()
                }),
                new LimitPricePolicy({
                    price: this.price
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        });
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(!this.price) {
            return "Missing limit price";
        }
        return await super.validate(ctx);
    }
}