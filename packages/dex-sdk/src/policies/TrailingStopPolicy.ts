import Base from './Base';

export interface TrailingStopParams {
    spotPercentage: number;
}

export default class TrailingStopPolicy extends Base {
   spotPercentage: number;

    static get tag() {
        return "TrailingStop";
    }

    constructor(props:TrailingStopParams) {
        super(TrailingStopPolicy.tag);
        this.spotPercentage = props.spotPercentage;
    }

    verify = ():string|undefined => {
        if(!this.spotPercentage) {
            return "TrailingStop requires a spotPercentage param";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                spotPercentage: this.spotPercentage
            }
        }
    }
}