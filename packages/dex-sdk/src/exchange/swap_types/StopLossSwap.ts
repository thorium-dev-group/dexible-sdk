import { BigNumber } from "ethers";
import { SwapOrderType, Price } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, IValidationContext, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, Limit, StopLoss } from "../../algos";
import { GasCostPolicy, LimitPricePolicy, SlippagePolicy, StopPricePolicy } from "../../policies";
import { validateFilters } from "../../extras";

export interface StopLossSwapConfig extends BaseSwapConfig {
    trigger: Price;
}

/**
 * StopLoss attempts to exit a position once the price hits or falls below 
 * a trigger price. Then it becomes a market order.
 */
export class StopLossSwap extends BaseSwap {
    trigger: Price;
    constructor(props: StopLossSwapConfig) {
        super(props, SwapOrderType.STOP_LOSS);
        this.trigger = props.trigger;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }
    
        return new StopLoss({
            policies: [
                ...this._basePolicies(),
                new StopPricePolicy({
                    above: false,
                    trigger: this.trigger
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        });
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(!this.trigger) {
            return "Missing trigger price";
        }
        return await super.validate(ctx);
    }
}