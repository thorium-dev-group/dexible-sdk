import Base, {BaseParams} from './Base';
import { LimitPricePolicy } from '../policies';

export interface LimitAlgoParams extends BaseParams {
    
}

export default class Limit extends Base  {

    static get tag() {
        return "Limit";
    }

    constructor(props:LimitAlgoParams) {
        super(props, Limit.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([LimitPricePolicy.tag]);
    }
}