import { TakeProfitPolicy as TP } from '../policies';
import Base, {BaseParams} from './Base';

export interface TakeProfitAlgoParams extends BaseParams {

}

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