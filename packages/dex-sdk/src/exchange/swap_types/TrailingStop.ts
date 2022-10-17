import { BigNumber } from "ethers";
import { SwapOrderType, Price } from "../../common";
import { BaseSwap, BaseSwapConfig, IValidationContext } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, TrailingStop } from "../../algos";
import { GasCostPolicy, SlippagePolicy, TrailingStopPolicy } from "../../policies";

export interface TrailingStopSwapConfig extends BaseSwapConfig {
    spotPercentage: number;
}

/**
 * TrailingStop requests follow the price of an asset up and resets the
 * peak price on each upward movement. Then it applies a percentage of 
 * drop below that peak before converting to a market order.
 */
export class TrailingStopSwap extends BaseSwap {
    spotPercentage: number;

    constructor(props: TrailingStopSwapConfig) {
        super(props, SwapOrderType.TAKE_PROFIT);
        this.spotPercentage = props.spotPercentage;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }

        return new TrailingStop({
            policies: [
                ...this._basePolicies(),
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