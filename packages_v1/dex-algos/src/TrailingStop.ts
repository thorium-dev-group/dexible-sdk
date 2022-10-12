import { TrailingStop as TS } from 'dexible-policies';
import Base, {BaseParams} from './Base';

export interface TrailingStopParams extends BaseParams {

}

export default class TrailingStop extends Base {

    static get tag() {
        return TS.tag
    }

    constructor(props: TrailingStopParams) {
        super(props, TS.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([TS.tag]);
    }
}