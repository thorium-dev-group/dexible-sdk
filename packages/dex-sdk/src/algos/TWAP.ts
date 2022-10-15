import { BoundedDelayPolicy } from '../policies';
import Base, {BaseParams} from './Base';

export interface TWAPAlgoParams extends BaseParams {

}

/**
 * Algo that will simply execute market order over a time window
 * with delays between each segment. Optional price bounds can be 
 * applied to the order o ensure the price stays withing bound.
 */
export default class TWAP extends Base {

    static get tag() {
        return "TWAP";
    }

    constructor(props: TWAPAlgoParams) {
        super(props, TWAP.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([BoundedDelayPolicy.tag]);
    }
}