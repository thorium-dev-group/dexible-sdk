import { BigNumber } from "ethers";
import { SwapOrderType, Price } from "../../common";
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

/**
 * StopLimit executes when two conditions are met: 
 * 1) the prices move above an initial trigger
 * 2) the price stays below a limit price
 * 
 * Once #1 is triggered, the request becomes a limit order and #2 applies
 */
export class StopLimitSwap extends BaseSwap {
    trigger: Price;
    limitPrice: Price;

    constructor(props: StopLimitSwapConfig) {
        super(props, SwapOrderType.STOP_LIMIT);
        this.trigger = props.trigger;
        this.limitPrice = props.limitPrice;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }
       
        return new StopLimit({
            policies: [
                ...this._basePolicies(),
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