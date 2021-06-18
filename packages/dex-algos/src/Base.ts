import {IPolicy, GasCost, Slippage} from 'dex-policies';
import { Verifiable, Serializable } from 'dex-common';


export interface BaseParams {
    policies: Array<IPolicy>;
}

export default class BaseAlgo {
    name:string;
    policies: Array<IPolicy>;

    serialize: Serializable;

    verify: Verifiable;

    constructor(props:BaseParams, name: string) {

        this.name = name;
        this.policies = props.policies;
        this.serialize = ():object => {
            return {
                algorithm: this.name,
                policies: this.policies.map(p => p.serialize())
            }
        };
        this.verify = ():string|undefined => {
            return this.verifyPolicies([]);
        }
    }

    verifyPolicies = (required?:Array<string>) : string | undefined => {
        if(!required) {
            required = [];
        }

        //must at least have gas cost and slippage
        let hasGas = false;
        let hasSlippage = false;
        let reqMatches:Array<string> = [];
        for(let i=0;i<this.policies.length;++i) {
            let p = this.policies[i];
            if(p.name === GasCost.tag) { hasGas = true};
            if(p.name === Slippage.tag) { hasSlippage = true};
            let err = p.verify();
            if(err) {
                return err;
            }
            if(required.indexOf(p.name)) {
                reqMatches.push(p.name);
            }
        }
        if(reqMatches.length !== required.length) {
            let missing = required.filter(r => !reqMatches.includes(r));
            return "Must have the following policies: " + missing;
        }

        if(hasGas && hasSlippage) {
            return undefined;
        }


        return "Must have at least GasCost and Slippage policies";
    }
}