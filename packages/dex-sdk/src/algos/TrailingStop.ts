import { TrailingStopPolicy as TS } from '../policies';
import Base, {BaseParams} from './Base';

export interface TrailingStopAlgoParams extends BaseParams {

}

export default class TrailingStop extends Base {

    static get tag() {
        return TS.tag
    }

    constructor(props: TrailingStopAlgoParams) {
        super(props, TS.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([TS.tag]);
    }
}