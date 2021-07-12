import Base from './Base';
import {Price} from 'dexible-common';

export interface StopPriceParams {
    trigger: Price;
    above: boolean;
}

export default class StopPrice extends Base {
    trigger: Price;
    above: boolean;

    static get tag() {
        return "StopPrice";
    }

    constructor(props:StopPriceParams) {
        super(StopPrice.tag);
        this.trigger = props.trigger;
        this.above = props.above;
    }

    verify = ():string|undefined => {
        if(!this.trigger) {
            return "StopPrice requires a trigger price param";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                trigger: this.trigger.toJSON(),
                above: this.above
            }
        }
    }
}