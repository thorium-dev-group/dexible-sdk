import { TakeProfit as TP } from 'dexible-policies';
import Base, {BaseParams} from './Base';

export interface TakeProfitParams extends BaseParams {

}

export default class TakeProfit extends Base {

    static get tag() {
        return TP.tag
    }

    constructor(props: TakeProfitParams) {
        super(props, TP.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([TP.tag]);
    }
}