import { StopLimitPolicy as SL } from '../policies';
import Base, {BaseParams} from './Base';

export interface StopLimitAlgoParams extends BaseParams {

}

/**
 * Stop limit algo that monitors for up-trending price and enters
 * a position after a trigger and up to a max limit.
 */
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