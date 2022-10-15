import {ethers} from 'ethers';
import { SDKError } from '../common';
import { IWeb3Factory } from '../common/IWeb3Factory';
import { getNetwork } from '../common/Networks';

let inst: Web3Factory | null = null;

export class Web3Factory {

    static get instance() {
        if(!inst) {
            inst = new Web3Factory();
        }
        return inst;
    }

    providers: {
        [k: number]: ethers.providers.Provider;
    } = {};
    suppliedImpl?: IWeb3Factory;

    set factoryImpl(impl: IWeb3Factory) {
        this.suppliedImpl = impl;
    }

    async getProvider(chainId: number): Promise<ethers.providers.Provider> {
        let p = this.providers[+chainId];
        
        if(!p) {
            if(!this.suppliedImpl) {
                throw new SDKError({
                    message: "Must provide an IWeb3Factory implementation to Dexible"
                });
            }

            p = await this.suppliedImpl.getProvider(chainId);
            this.providers[chainId] = p;
        }
        return p;
    }
}