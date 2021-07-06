import * as Algos from 'dex-algos';
import * as Policies from 'dex-policies';
import moment from 'moment';
import Logger from 'dex-logger';
import {Price} from 'dex-common';

const log = new Logger({component: "AlgoFactory"});

export interface GasPolicyProps {
    type: "relative" | "fixed";
    deviation?: number;
    amount?: number; //in gwei
}

export interface CommonProps {
    type: string;
    maxRounds?: number;
    gasPolicy: GasPolicyProps;
    slippagePercent: number;
}

export interface StopLossProps extends CommonProps {
    triggerPrice: Price;
    isAbove: boolean;
}

export interface PriceRangeProps {
    basePrice: Price;
    upperBoundPercent: number;
    lowerBoundPercent: number;
}


export interface LimitProps extends CommonProps {
    price: Price;
}


export interface TWAPProps extends CommonProps {
    timeWindow: string;
    randomizeDelay?: boolean;
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

    createTWAP = (props:TWAPProps): Algos.TWAP => {
        let duration = moment.duration('PT' + props.timeWindow.toUpperCase()).asSeconds();
        
        log.debug("Parsed TWAP duration in seconds", duration);
        if(!duration) {
            throw new Error("Invalid timeWindow duration. Using something like 24h");
        }

        let policies = [
            ...this._buildBasePolicies(props),
            new Policies.BoundedDelay({
                randomizeDelay: props.randomizeDelay || false,
                timeWindowSeconds: duration
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
        return [
            new Policies.GasCost({
                gasType: props.gasPolicy.type,
                amount: props.gasPolicy.amount,
                deviation: props.gasPolicy.deviation
            }),
            new Policies.Slippage({
                amount: props.slippagePercent
            })
        ]
    }

}