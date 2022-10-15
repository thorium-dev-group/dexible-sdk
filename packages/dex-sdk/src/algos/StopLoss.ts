import { StopPricePolicy } from '../policies';
import Base, {BaseParams} from './Base';

export interface StopLossAlgoParams extends BaseParams {

}

/**
 * Stop loss algo that converts to market order once market price
 * drops below a trigger.
 */
export default class StopLoss extends Base {

    static get tag() {
        return "StopLoss";
    }

    constructor(props: StopLossAlgoParams) {
        super(props, StopLoss.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([StopPricePolicy.tag]);
    }
}