import { BigNumber } from "ethers";
import { SwapOrderType } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, Market } from "../../algos";
import { GasCostPolicy, SlippagePolicy } from "../../policies";
import { validateFilters } from "../../extras";

/**
 * Market swap executes at whatever the current market spot price is
 */
export class MarketSwap extends BaseSwap {

    constructor(props: BaseSwapConfig) {
        super(props, SwapOrderType.MARKET);
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }
        
        return new Market({
            policies: this._basePolicies(),
            maxRounds: this.customizations?.maxNumberRounds
        })
    }
}