import Base, {BaseParams} from './Base';

export interface MarketAlgoParams extends BaseParams {
    
}

/**
 * Basic market order without restrictions or conditions
 */
export default class Market extends Base {

    static get tag() {
        return "Market";
    }

    constructor(props:MarketAlgoParams) {
        super(props, Market.tag);
    }
}