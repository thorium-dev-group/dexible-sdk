import Base, {BaseParams} from './Base';

export interface MarketAlgoParams extends BaseParams {
    
}

export default class Market extends Base {

    static get tag() {
        return "Market";
    }

    constructor(props:MarketAlgoParams) {
        super(props, Market.tag);
    }
}