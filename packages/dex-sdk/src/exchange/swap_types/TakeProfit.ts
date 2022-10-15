import { BigNumber } from "ethers";
import { OrderType, Price } from "../../common";
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

export class TakeProfitSwap extends BaseSwap {
    profitPercentage: number;
    startingPrice: Price;
    constructor(props: TakeProfitSwapConfig) {
        super(props, OrderType.TAKE_PROFIT);
        this.profitPercentage = props.profitPercentage;
        this.startingPrice = props.startingPrice;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }

        return new TakeProfit({
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