import { BigNumberish } from 'ethers';
import Base from './Base';

export interface GasCostParams {
    gasType: "relative" | "fixed";
    amount?: BigNumberish;
    deviation?: number;
}

export default class GasCost extends Base {
    
    gasType: string;
    amount?: BigNumberish;
    deviation?: number;

    static get tag() {
        return "GasCost";
    }

    constructor(props:GasCostParams) {
        super(GasCost.tag);
        this.gasType = props.gasType;
        this.amount = props.amount;
        this.deviation = props.deviation;
    }

    verify = ():string|undefined => {
        if(this.gasType === 'fixed') {
            if(!this.amount) {
                return "Fixed gas type requires an amount parameter"
            }
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                gasType: this.gasType,
                amount: this.amount,
                deviation: this.deviation
            }
        }
    }
}