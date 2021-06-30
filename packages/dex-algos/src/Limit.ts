import Base, {BaseParams} from './Base';
import { LimitPrice } from 'dex-policies';

export interface LimitParams extends BaseParams {
    
}

export default class Limit extends Base  {

    static get tag() {
        return "Limit";
    }

    constructor(props:LimitParams) {
        super(props, Limit.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([LimitPrice.tag]);
    }
}