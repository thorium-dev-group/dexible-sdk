import { StopLimitPolicy as SL } from '../policies';
import Base, {BaseParams} from './Base';

export interface StopLimitAlgoParams extends BaseParams {

}

export default class StopLimit extends Base {

    static get tag() {
        return SL.tag
    }

    constructor(props: StopLimitAlgoParams) {
        super(props, SL.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([SL.tag]);
    }
}