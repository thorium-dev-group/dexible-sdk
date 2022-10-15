import {IPolicy, GasCostPolicy, SlippagePolicy} from '../policies';
import Logger from '../logger';
import IAlgo from './IAlgo';

const log = new Logger({component: "BaseAlgo"});

/**
 * Algo base class that holds policies for specific algos
 */
export interface BaseParams {
    policies: Array<IPolicy>;
    maxRounds?: number;
}

export default abstract class BaseAlgo implements IAlgo {
    name:string;
    policies: Array<IPolicy>;
    maxRounds: () => number;
    
    constructor(props:BaseParams, name: string) {

        this.name = name;
        this.policies = props.policies;
        this.maxRounds = () => {
            return props.maxRounds || 0;
        }
    }

    serialize(): object {
        const deduped = this.policies.reduce((o, p, i) => {
            o[p.name] = {
                policy: p,
                priority: i
            };
            return o;
        }, {});
        let sorted = Object.keys(deduped).map(k => deduped[k]);
        sorted.sort((a, b)=> a.priority - b.priority);
       
        return {
            algorithm: this.name,
            policies: sorted.map(p => p.policy.serialize())
        }
    }
    
    verify(): string | undefined {
        return this.verifyPolicies([ ]);
    }

    getSlippage = ():number => {
        let slip = this.policies.filter(p => p.name === SlippagePolicy.tag)[0] as SlippagePolicy;
        if(!slip) {
            return 0;
        }
        return slip.amount;
    }

    verifyPolicies = (required?:Array<string>) : string | undefined => {
        if(!required) {
            required = [];
        }

        //must at least have gas cost and slippage
        let hasGas = false;
        let hasSlippage = false;
        let dupCheck = {};

        let reqMatches:Array<string> = [];
        log.info(this.name, "verifying policies");
        for(let i=0;i<this.policies.length;++i) {
            let p = this.policies[i];
            log.debug("Checking policy", p.name);
            if(dupCheck[p.name]) {
                return "Found duplicate policy definition: " + p.name;
            }
            dupCheck[p.name] = true;
            if(p.name === GasCostPolicy.tag) { hasGas = true};
            if(p.name === SlippagePolicy.tag) { hasSlippage = true};
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