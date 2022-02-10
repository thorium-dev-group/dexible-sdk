import Base from './Base';
import {Price} from 'dexible-common';

export interface TrailingStopParams {
    spotPercentage: number;
}

export default class TrailingStop extends Base {
   spotPercentage: number;

    static get tag() {
        return "TrailingStop";
    }

    constructor(props:TrailingStopParams) {
        super(TrailingStop.tag);
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