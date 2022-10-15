import { StopPricePolicy } from '../policies';
import Base, {BaseParams} from './Base';

export interface StopLossAlgoParams extends BaseParams {

}

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