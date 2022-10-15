import Base from './Base';

export interface FailLimitParams {
    maxFailures: number;
}

export default class FailLimitPolicy extends Base {
    maxFailures: number;

    static get tag() {
        return "FailLimit";
    }
    
    constructor(props:FailLimitParams) {
        super(FailLimitPolicy.tag);
        this.maxFailures = props.maxFailures;
    }

    verify = ():string|undefined => {
        if(!this.maxFailures) {
            return "FailLimit requires maxFailures parameter";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                maxFailures: this.maxFailures
            }
        }
    }
}