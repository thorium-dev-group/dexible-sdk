import Base from './Base';
import {Price} from '../common';

export interface PriceBoundsParams {
    basePrice: Price;
    upperBoundPercent: number;
    lowerBoundPercent: number;
}

export default class PriceBoundsPolicy extends Base {
    basePrice: Price;
    upperBoundPercent: number;
    lowerBoundPercent: number;


    static get tag() {
        return "PriceBounds";
    }

    constructor(props:PriceBoundsParams) {
        super(PriceBoundsPolicy.tag);
        this.basePrice = props.basePrice;
        this.upperBoundPercent = props.upperBoundPercent;
        this.lowerBoundPercent = props.lowerBoundPercent;
    }

    verify = ():string|undefined => {
        if(!this.basePrice) {
            return "PriceBounds requires a basePrice param";
        }
        if(!this.upperBoundPercent && !this.lowerBoundPercent) {
            return "PriceBounds requires either an upperBoundPercent or lowerBoundPercent parameter or both";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                basePrice: this.basePrice.toJSON(),
                upperBoundPercentage: this.upperBoundPercent,
                lowerBoundPercentage: this.lowerBoundPercent
            }
        }
    }
}