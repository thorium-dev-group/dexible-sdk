import { BoundedDelay } from 'dex-policies';
import Base, {BaseParams} from './Base';

export interface TWAPParams extends BaseParams {

}

export default class TWAP extends Base {

    static get tag() {
        return "TWAP";
    }

    constructor(props: TWAPParams) {
        super(props, TWAP.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([BoundedDelay.tag]);
    }
}