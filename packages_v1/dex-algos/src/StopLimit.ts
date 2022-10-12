import { StopLimit as SL } from 'dexible-policies';
import Base, {BaseParams} from './Base';

export interface StopLimitParams extends BaseParams {

}

export default class StopLimit extends Base {

    static get tag() {
        return SL.tag
    }

    constructor(props: StopLimitParams) {
        super(props, SL.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([SL.tag]);
    }
}