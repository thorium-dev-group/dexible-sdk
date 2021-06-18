import Base from './Base';

export interface LimitPriceParams {
    limitAction: "buy" | "sell";
    price: number;
}

export default class LimitPrice extends Base {

    limitAction: string;
    price: number;

    static get tag() {
        return "LimitPrice";
    }

    constructor(props:LimitPriceParams) {
        super(LimitPrice.tag);
        this.limitAction = props.limitAction;
        this.price = props.price;
    }

    verify = ():string|undefined => {
        if(!this.limitAction) {
            return "LimitPrice requires a limitAction of buy or sell";
        }
        if(!this.price) {
            return "LimitPrice requires a price expressed in input token units";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                limitAction: this.limitAction,
                price: this.price
            }
        }
    }
}