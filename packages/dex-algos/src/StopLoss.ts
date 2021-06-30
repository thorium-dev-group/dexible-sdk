import { StopPrice } from 'dex-policies';
import Base, {BaseParams} from './Base';

export interface StopLossParams extends BaseParams {

}

export default class StopLoss extends Base {

    static get tag() {
        return "StopLoss";
    }

    constructor(props: StopLossParams) {
        super(props, StopLoss.tag);
    }

    verify = () : string | undefined => {
        return this.verifyPolicies([StopPrice.tag]);
    }
}