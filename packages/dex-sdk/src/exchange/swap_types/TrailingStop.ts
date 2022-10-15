import { BigNumber } from "ethers";
import { OrderType, Price } from "../../common";
import { BaseSwap, BaseSwapConfig, IValidationContext } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, TrailingStop } from "../../algos";
import { GasCostPolicy, SlippagePolicy, TrailingStopPolicy } from "../../policies";

export interface TrailingStopSwapConfig extends BaseSwapConfig {
    spotPercentage: number;
}

export class TrailingStopSwap extends BaseSwap {
    spotPercentage: number;

    constructor(props: TrailingStopSwapConfig) {
        super(props, OrderType.TAKE_PROFIT);
        this.spotPercentage = props.spotPercentage;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }

        return new TrailingStop({
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
                new TrailingStopPolicy({
                    spotPercentage: this.spotPercentage
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        });
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(!this.spotPercentage || this.spotPercentage < 0) {
            return "Invalid spotPercentage";
        }
        return await super.validate(ctx);
    }
}