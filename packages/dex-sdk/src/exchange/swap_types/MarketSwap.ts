import { BigNumber } from "ethers";
import { OrderType } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, Market } from "../../algos";
import { GasCostPolicy, SlippagePolicy } from "../../policies";
import { validateFilters } from "../../extras";

export class MarketSwap extends BaseSwap {

    constructor(props: BaseSwapConfig) {
        super(props, OrderType.MARKET);
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }
        
        return new Market({
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
                })
            ],
            maxRounds: this.customizations?.maxNumberRounds
        })
    }
}