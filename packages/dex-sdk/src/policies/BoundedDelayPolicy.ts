import Base from './Base';

export interface BoundedDelayParams {
    timeWindowSeconds: number;
    randomizeDelay: boolean;
    expireAfterTimeWindow?: boolean;
}

export default class BoundedDelayPolicy extends Base {
    timeWindowSeconds: number;
    randomizeDelay: boolean;
    expireAfterTimeWindow?: boolean;

    static get tag() {
        return "BoundedDelay";
    }

    constructor(props:BoundedDelayParams) {
        super(BoundedDelayPolicy.tag);
        this.timeWindowSeconds = props.timeWindowSeconds;
        this.expireAfterTimeWindow = props.expireAfterTimeWindow;
        this.randomizeDelay = props.randomizeDelay;
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                timeWindow: this.timeWindowSeconds,
                randomize: this.randomizeDelay,
                expireAfterTimeWindow: this.expireAfterTimeWindow
            }
        }
    }

    verify = ():string|undefined => {
        if(!this.timeWindowSeconds) {
            return "BoundedDelay requires timeWindowSeconds"
        }
    }
}