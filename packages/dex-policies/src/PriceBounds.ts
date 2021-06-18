import Base from './Base';

export interface PriceBoundsParams {
    basePrice: number;
    upperBoundPercent: number;
    lowerBoundPercent: number;
}

export default class PriceBounds extends Base {
    basePrice: number;
    upperBoundPercent: number;
    lowerBoundPercent: number;


    static get tag() {
        return "PriceBounds";
    }

    constructor(props:PriceBoundsParams) {
        super(PriceBounds.tag);
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
                basePrice: this.basePrice,
                upperBoundPercent: this.upperBoundPercent,
                lowerBoundPercent: this.lowerBoundPercent
            }
        }
    }
}