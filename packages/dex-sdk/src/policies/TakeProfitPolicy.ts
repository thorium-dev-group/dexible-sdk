import Base from './Base';
import {Price} from '../common';

export interface TakeProfitParams {
    profitPercentage: number;
    startingPrice?: Price;
}

export default class TakeProfitPolicy extends Base {
    profitPercentage: number;
    startingPrice?: Price;

    static get tag() {
        return "TakeProfit";
    }

    constructor(props:TakeProfitParams) {
        super(TakeProfitPolicy.tag);
        this.profitPercentage = props.profitPercentage;
        this.startingPrice = props.startingPrice;
    }

    verify = ():string|undefined => {
        if(!this.profitPercentage) {
            return "TakeProfit requires a profit percentage";
        }
        if(this.startingPrice && !this.startingPrice.inToken) {
            return "TakeProfit requires a price object if setting the startingPrice param";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                profitPercentage: this.profitPercentage,
                startingPrice: this.startingPrice?.toJSON()
            }
        }
    }
}