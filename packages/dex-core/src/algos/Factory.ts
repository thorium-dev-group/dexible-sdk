import * as Algos from 'dexible-algos';
import * as Policies from 'dexible-policies';
import Logger from 'dexible-logger';
import {Price} from 'dexible-common';

const log = new Logger({component: "AlgoFactory"});
const dur = require("dayjs/plugin/duration");
const dayjs = require("dayjs");
dayjs.extend(dur);

export interface GasPolicyProps {
    type: "relative" | "fixed";
    deviation?: number;
    amount?: number; //in gwei
}

export interface CommonProps {
    type: string;
    maxRounds?: number;
    expiration?: number;
    gasPolicy: GasPolicyProps;
    slippagePercent: number;
}

export interface StopLossProps extends CommonProps {
    triggerPrice: Price;
    isAbove: boolean;
}

export interface StopLimitProps extends CommonProps {
    trigger: Price;
    limitPrice: Price;
}

export interface PriceRangeProps {
    basePrice: Price;
    upperBoundPercent: number;
    lowerBoundPercent: number;
}


export interface LimitProps extends CommonProps {
    price: Price;
}

export interface Duration {
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
    weeks?: number;
    months?: number;
}

export interface TWAPProps extends CommonProps {
    timeWindow: Duration;
    randomizeDelay?: boolean;
    expireAfterTimeWindow?: boolean;
    priceRange?: PriceRangeProps;
}

export default class Factory {

    

    createMarket = (props:CommonProps): Algos.Market => {
        return new Algos.Market({
            maxRounds: props.maxRounds,
            policies: [
                ...this._buildBasePolicies(props)
            ]
        })
    }

    createLimit = (props:LimitProps): Algos.Limit => {
        //invert price since quotes are in output tokens while prices are 
        //expressed in input tokens
        let policies = [
            ...this._buildBasePolicies(props),
            new Policies.LimitPrice({
                price: props.price
            })
        ];

        return new Algos.Limit({
            maxRounds: props.maxRounds,
            policies
        })
    }

    createStopLoss = (props:StopLossProps): Algos.StopLoss => {
        return new Algos.StopLoss({
            maxRounds: props.maxRounds,
            policies: [
                ...this._buildBasePolicies(props),
                new Policies.StopPrice({
                    trigger: props.triggerPrice,
                    above: props.isAbove
                })
            ]
        })
    }

    createStopLimit = (props:StopLimitProps): Algos.StopLimit => {
        return new Algos.StopLimit({
            maxRounds: props.maxRounds,
            policies: [
                ...this._buildBasePolicies(props),
                new Policies.StopLimit({
                    trigger: props.trigger,
                    limitPrice: props.limitPrice
                })
            ]
        })
    }

    createTWAP = (props:TWAPProps): Algos.TWAP => {
        //let duration = moment.duration('PT' + props.timeWindow.toUpperCase()).asSeconds();
        let d = dayjs.duration(props.timeWindow);
        log.debug("Parsed TWAP duration in seconds", Math.ceil(d.asSeconds()));
       
        let policies = [
            ...this._buildBasePolicies(props),
            new Policies.BoundedDelay({
                randomizeDelay: props.randomizeDelay || false,
                timeWindowSeconds: Math.ceil(d.asSeconds()),
                expireAfterTimeWindow: props.expireAfterTimeWindow
            })
        ];
        if(props.priceRange) {
            //invert price since quotes are in output tokens while prices are 
            //expressed in input tokens
            policies.push(new Policies.PriceBounds({
                basePrice: props.priceRange.basePrice,
                lowerBoundPercent: props.priceRange.lowerBoundPercent,
                upperBoundPercent: props.priceRange.upperBoundPercent
            }));
        }

        return new Algos.TWAP({
            maxRounds: props.maxRounds,
            policies
        });
    }

    _buildBasePolicies = (props:CommonProps): Array<Policies.IPolicy> => {
        let set:Array<Policies.IPolicy> = [
            new Policies.GasCost({
                gasType: props.gasPolicy.type,
                amount: props.gasPolicy.amount,
                deviation: props.gasPolicy.deviation
            }),
            new Policies.Slippage({
                amount: props.slippagePercent
            })
        ]
        if(props.expiration) {
            set = [
                new Policies.Expiration({
                    seconds: props.expiration
                }),
                ...set
            ]
        }

        return set;
    }

}