import { BigNumber } from "ethers";
import { OrderType, Price } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, IValidationContext, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, StopLimit } from "../../algos";
import { GasCostPolicy, StopLimitPolicy, SlippagePolicy } from "../../policies";
import { validateFilters } from "../../extras";

export interface StopLimitSwapConfig extends BaseSwapConfig {
    trigger: Price;
    limitPrice: Price;
}
export class StopLimitSwap extends BaseSwap {
    trigger: Price;
    limitPrice: Price;

    constructor(props: StopLimitSwapConfig) {
        super(props, OrderType.STOP_LIMIT);
        this.trigger = props.trigger;
        this.limitPrice = props.limitPrice;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }
       
        return new StopLimit({
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
                new StopLimitPolicy({
                    limitPrice: this.limitPrice,
                    trigger: this.trigger
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        });
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(!this.limitPrice) {
            return "Missing limit price";
        }
        if(!this.trigger) {
            return "Missing trigger price";
        }

        const limit = this.limitPrice.rate;
        const t = this.trigger.rate;
        if(t > limit) {
            return `Stop limit trigger price ${t} is higher than limit price ${limit}. Swap will never execute`
        }
        return await super.validate(ctx);
    }
}