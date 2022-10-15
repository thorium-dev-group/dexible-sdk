import IPolicy from './IPolicy';

export default class BasePolicy implements IPolicy {
    
    name: string;

    constructor(name:string) {
        this.name = name;
    }
    
    serialize = ():object => {
        throw new Error("Must implement serialize function");
    }

    verify = ():string|undefined => {
        throw new Error("Must implement verify function");
    }
}