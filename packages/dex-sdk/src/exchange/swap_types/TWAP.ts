import { BigNumber } from "ethers";
import { OrderType, Price } from "../../common";
import { BaseSwap, BaseSwapConfig, IValidationContext } from "./BaseSwap";
import {units} from '../../common';
import { IAlgo, TWAP } from "../../algos";
import { GasCostPolicy, SlippagePolicy, BoundedDelayPolicy, PriceBoundsPolicy, IPolicy } from "../../policies";

export interface PriceRangeProps {
    basePrice: Price;
    upperBoundPercent?: number;
    lowerBoundPercent?: number;
}

export interface TWAPConfig extends BaseSwapConfig {
    timeWindowSeconds: number;
    //randomizeDelay?: boolean; on by defaul
    expireAfterTimeWindow?: boolean;
    priceRange?: PriceRangeProps;
}

export class TWAPSwap extends BaseSwap {
    timeWindowSeconds: number;
    expireAfterTimeWindow?: boolean;
    priceRange?: PriceRangeProps;

    constructor(props: TWAPConfig) {
        super(props, OrderType.TWAP);
        this.timeWindowSeconds = props.timeWindowSeconds;
        this.expireAfterTimeWindow = props.expireAfterTimeWindow;
        this.priceRange = props.priceRange;
    }

    toAlgo(): IAlgo {
        let maxFixedGas: BigNumber | undefined = undefined;
        if(this.customizations?.maxGasPriceGwei) {
            maxFixedGas = units.inBNUnits(this.customizations.maxGasPriceGwei, 9);
        }
        
        const policies:Array<IPolicy> = [
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
            new BoundedDelayPolicy({
                randomizeDelay: true,
                timeWindowSeconds: this.timeWindowSeconds,
                expireAfterTimeWindow: this.expireAfterTimeWindow
            })
        ];
        if(this.priceRange) {
            policies.push(new PriceBoundsPolicy({
                basePrice: this.priceRange.basePrice,
                lowerBoundPercent: this.priceRange.lowerBoundPercent || 0,
                upperBoundPercent: this.priceRange.upperBoundPercent || 0
            }));
        }

        return new TWAP({
            policies,
            maxRounds: this.customizations?.maxNumberRounds
        })
    }

    async validate(ctx: IValidationContext): Promise<string | undefined> {
        if(this.priceRange) {
            const lb = this.priceRange.lowerBoundPercent;
            const ub = this.priceRange.upperBoundPercent;
            if(!lb && !ub) {
                return "Must have at least an upper or lower bound percentage"
            }
            if(lb && ub) {
                if(lb > ub) {
                    return "Lower bound is higher than upper bound";
                }
            }
        }
        return await super.validate(ctx);

    }
}