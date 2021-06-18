import Base from './Base';

export interface BoundedDelayParams {
    timeWindowSeconds: number;
    randomizeDelay: boolean;
}

export default class BoundedDelay extends Base {
    timeWindowSeconds: number;
    randomizeDelay: boolean;

    static get tag() {
        return "BoundedDelay";
    }

    constructor(props:BoundedDelayParams) {
        super(BoundedDelay.tag);
        this.timeWindowSeconds = props.timeWindowSeconds;
        this.randomizeDelay = props.randomizeDelay;
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                timeWindow: this.timeWindowSeconds,
                randomize: this.randomizeDelay
            }
        }
    }

    verify = ():string|undefined => {
        if(!this.timeWindowSeconds) {
            return "BoundedDelay requires timeWindowSeconds"
        }
    }
}