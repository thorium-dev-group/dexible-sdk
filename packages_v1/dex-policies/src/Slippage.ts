import Base from './Base';

export interface SlippageParams {
    amount: number;
}

export default class Slippage extends Base {

    amount: number;

    static get tag() {
        return "Slippage";
    }

    constructor(props:SlippageParams) {
        super(Slippage.tag);
        this.amount = props.amount;
    }

    verify = ():string|undefined => {
        if(!this.amount) {
            return "Slippage requires an amount param";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                amount: this.amount
            }
        }
    }
}