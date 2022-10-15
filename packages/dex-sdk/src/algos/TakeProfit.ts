import { TakeProfitPolicy as TP } from '../policies';
import Base, {BaseParams} from './Base';

export interface TakeProfitAlgoParams extends BaseParams {

}

/**
 * Algo that watches market price and converts to market order 
 * once price meets minimum profit level.
 */
export default class TakeProfit extends Base {

    static get tag() {
        return TP.tag
    }

    constructor(props: TakeProfitAlgoParams) {
        super(props, TP.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([TP.tag]);
    }
}