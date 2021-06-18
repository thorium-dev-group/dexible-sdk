import Base, {BaseParams} from './Base';

export interface MarketParams extends BaseParams {
    
}

export default class Market extends Base {

    static get tag() {
        return "Market";
    }

    constructor(props:MarketParams) {
        super(props, Market.tag);
    }
}