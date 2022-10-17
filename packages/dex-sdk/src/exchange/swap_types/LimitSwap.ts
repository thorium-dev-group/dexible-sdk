import { BigNumber } from "ethers";
import { SwapOrderType, Price } from "../../common";
import { QuoteRequest } from "../../services/quote/QuoteService";
import { BaseSwap, BaseSwapConfig, IValidationContext, MIN_SLIPPAGE } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, Limit } from "../../algos";
import { GasCostPolicy, LimitPricePolicy, SlippagePolicy } from "../../policies";
import { validateFilters } from "../../extras";

export interface LimitSwapConfig extends BaseSwapConfig {
    price: Price;
}

/**
 * Limit swap request is to only execute the swap if the price hits a particular
 * price.
 */
export class LimitSwap extends BaseSwap {
    price: Price;

    constructor(props: LimitSwapConfig) {
        super(props, SwapOrderType.LIMIT);
        this.price = props.price;
    }

    toQuoteRequest(): QuoteRequest {
        const qr:QuoteRequest = super.toQuoteRequest();
        qr.fixedPrice = this.price.rate;
        return qr;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei.toFixed(9), 9);
        }

        return new Limit({
            policies: [
                ...this._basePolicies(),
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