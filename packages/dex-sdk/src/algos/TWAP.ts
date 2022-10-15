import { BoundedDelayPolicy } from '../policies';
import Base, {BaseParams} from './Base';

export interface TWAPAlgoParams extends BaseParams {

}

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