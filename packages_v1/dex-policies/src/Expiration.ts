import Base from './Base';

export interface ExpirationParams {
    seconds: number;
}

export default class Expiration extends Base {

    seconds: number;

    static get tag() {
        return "Expiration";
    }
    constructor(props:ExpirationParams) {
        super(Expiration.tag);
        this.seconds = props.seconds;
    }

    verify = ():string|undefined  => {
        if(!this.seconds) {
            return "Expiration requires seconds parameter";
        }
    }

    serialize = ():object => {
        return {
            type: this.name,
            params: {
                seconds: this.seconds
            }
        }
    }
}