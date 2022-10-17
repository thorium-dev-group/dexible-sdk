import { BigNumber } from "ethers";
import { SwapOrderType, Price } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, IValidationContext, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, TakeProfit } from "../../algos";
import { GasCostPolicy, SlippagePolicy, TakeProfitPolicy } from "../../policies";
import { validateFilters } from "../../extras";

export interface TakeProfitSwapConfig extends BaseSwapConfig {
    profitPercentage: number;
    startingPrice: Price;
}

/**
 * TakeProfit exits a position once the profit level reaches a specified
 * threshold. Once tripped, it converts to a market order.
 */
export class TakeProfitSwap extends BaseSwap {
    profitPercentage: number;
    startingPrice: Price;
    constructor(props: TakeProfitSwapConfig) {
        super(props, SwapOrderType.TAKE_PROFIT);
        this.profitPercentage = props.profitPercentage;
        this.startingPrice = props.startingPrice;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }

        return new TakeProfit({
            policies: [
                ...this._basePolicies(),
                new TakeProfitPolicy({
                    profitPercentage: this.profitPercentage,
                    startingPrice: this.startingPrice
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        });
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(!this.profitPercentage || this.profitPercentage < 0) {
            return "Invalid profitPercentage";
        }
        return await super.validate(ctx);
    }
}