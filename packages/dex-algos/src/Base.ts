import {IPolicy, GasCost, Slippage} from 'dex-policies';
import { Verifiable, Serializable } from 'dex-common';
import Logger from 'dex-logger';

const log = new Logger({component: "BaseAlgo"});

export interface BaseParams {
    policies: Array<IPolicy>;
    maxRounds?: number;
}

export default class BaseAlgo {
    name:string;
    policies: Array<IPolicy>;
    maxRounds?: number;

    serialize: Serializable;

    verify: Verifiable;

    constructor(props:BaseParams, name: string) {

        this.name = name;
        this.policies = props.policies;
        this.maxRounds = props.maxRounds;
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
        log.info(this.name, "verifying policies");
        for(let i=0;i<this.policies.length;++i) {
            let p = this.policies[i];
            log.debug("Checking policy", p.name);
            if(p.name === GasCost.tag) { hasGas = true};
            if(p.name === Slippage.tag) { hasSlippage = true};
            let err = p.verify();
            if(err) {
                log.error("Policy verification failed", err);
                return err;
            }
            if(required.indexOf(p.name) >= 0) {
                log.debug("Adding required match that passed", p.name);
                reqMatches.push(p.name);
            }
        }
        if(reqMatches.length !== required.length) {
            log.debug("Required and matches don't match", reqMatches, required);
            let missing = required.filter(r => !reqMatches.includes(r));
            return "Must have the following policies: " + missing;
        }

        if(hasGas && hasSlippage) {
            log.debug("All policies verified");
            return undefined;
        }


        return "Must have at least GasCost and Slippage policies";
    }
}