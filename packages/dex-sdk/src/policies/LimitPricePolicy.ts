import Base from './Base';
import {Price} from '../common';

export interface LimitPriceParams {
    price: Price;
}

export default class LimitPricePolicy extends Base {

    price: Price;

    static get tag() {
        return "LimitPrice";
    }

    constructor(props:LimitPriceParams) {
        super(LimitPricePolicy.tag);
        this.price = props.price;
    }

    verify = ():string|undefined => {
        if(!this.price) {
            return "LimitPrice requires a price expressed in input token units";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                price: this.price.toJSON()
            }
        }
    }
}