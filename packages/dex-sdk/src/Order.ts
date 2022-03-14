import { SDK, Token, Policies, Price, Tag, Algos } from "./";
import {BigNumberish} from 'ethers';

const dur = require("dayjs/plugin/duration");
const dayjs = require("dayjs");
dayjs.extend(dur);

export interface GasPolicyProps {
    type: "relative" | "fixed";
    deviation?: number;
    amount?: number; //in gwei
}

export interface CommonProps {
    sdk?: SDK;
    type?: string;
    maxRounds?: number;
    expiration?: number;
    gasPolicy: GasPolicyProps;
    slippagePercent: number;
    tags?: Array<Tag>;
    trader: string;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
}

export interface MarketProps extends CommonProps{}

export interface StopLossProps extends CommonProps {
    triggerPrice: Price;
    isAbove: boolean;
}

export interface StopLimitProps extends CommonProps {
    trigger: Price,
    limitPrice: Price
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
    priceRange?: PriceRangeProps;
}

export default class Order {

    static async create(props:CommonProps) {
        let o = new Order(props);
        await o._prepare();
        return o.order;
    }

    algo: Algos.IAlgo | null;
    maxRounds?: number;
    tags?: Array<Tag>;
    sdk: SDK;
    trader: string;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BigNumberish;
    order: any;
    
    private constructor(props:CommonProps) {
        if(!props.sdk || !props.type) {
            throw new Error("Invalid order properties");
        }
        this.tags = props.tags;
        this.maxRounds = props.maxRounds;
        this.sdk = props.sdk;
        this.trader = props.trader;
        this.tokenIn = props.tokenIn;
        this.tokenOut = props.tokenOut;
        this.amountIn = props.amountIn;
        this.algo = null;

        switch(props.type) {
            case Algos.types.Limit: {
                this.createLimit(props as LimitProps);
                break;
            }
            case Algos.types.Market: {
                this.createMarket(props);
                break;
            }
            case Algos.types.StopLoss: {
                this.createStopLoss(props as StopLossProps);
                break;
            }
            case Algos.types.StopLimit: {
                this.createStopLimit(props as StopLimitProps);
                break;
            }
            case Algos.types.TWAP: {
                this.createTWAP(props as TWAPProps);
                break;
            }
            default: throw new Error("Unsupported algo type: " + props.type);
        }
    }

    async submit():Promise<any> {
        if(!this.order) {
            await this._prepare();
        }
        return this.order.submit();
    }

    createMarket = (props:CommonProps)  => {
        this.algo = new Algos.Market({
            maxRounds: props.maxRounds,
            policies: [
                ...this._buildBasePolicies(props)
            ]
        });
    }

    createLimit = (props:LimitProps)  => {
        //invert price since quotes are in output tokens while prices are 
        //expressed in input tokens
        let policies = [
            ...this._buildBasePolicies(props),
            new Policies.LimitPrice({
                price: props.price
            })
        ];

        this.algo = new Algos.Limit({
            maxRounds: props.maxRounds,
            policies
        });
    }

    createStopLoss = (props:StopLossProps)  => {
        this.algo = new Algos.StopLoss({
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

    createStopLimit = (props:StopLimitProps) => {
        this.algo = new Algos.StopLimit({
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

    createTWAP = (props:TWAPProps)  => {
        let d = dayjs.duration(props.timeWindow);
       
        let policies = [
            ...this._buildBasePolicies(props),
            new Policies.BoundedDelay({
                randomizeDelay: props.randomizeDelay || false,
                timeWindowSeconds: Math.ceil(d.asSeconds())
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

        this.algo = new Algos.TWAP({
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
        ];
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

    async _prepare() {
        if(!this.algo) {
            throw new Error("No algo in order");
        }
        let r = await this.sdk.order.prepare({
            algo: this.algo,
            amountIn: this.amountIn,
            trader: this.trader,
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            tags: this.tags
        });
        if(r.error) {
            throw new Error(r.error||"Unknown problem with order");
        }
        if(!r.order) {
            throw new Error("Could not prepare order for submission");
        }
        this.order = r.order;
    }
}