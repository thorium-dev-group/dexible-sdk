import Base from './Base';
import {Price} from '../common';

export interface StopLimitParams {
    trigger: Price;
    limitPrice: Price;
}

export default class StopLimitPolicy extends Base {
    trigger: Price;
    limitPrice: Price;

    static get tag() {
        return "StopLimit";
    }

    constructor(props:StopLimitParams) {
        super(StopLimitPolicy.tag);
        this.trigger = props.trigger;
        this.limitPrice = props.limitPrice;
    }

    verify = ():string|undefined => {
        if(!this.trigger) {
            return "StopLimit requires a trigger price param";
        }
        if(!this.limitPrice) {
            return "StopLimit requires a limitPrice param";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                trigger: this.trigger.toJSON(),
                limitPrice: this.limitPrice.toJSON()
            }
        }
    }
}