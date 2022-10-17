import {ethers} from 'ethers';
import { IWeb3Factory } from '../common';

export class InfuraWeb3Factory implements IWeb3Factory {

    providers: {
        [k: number]: ethers.providers.Provider;
    } = {};

    constructor(
        readonly infuraKey: string
    ) { }

    async getProvider(chainId: number): Promise<ethers.providers.Provider> {
        let p = this.providers[+chainId];
        
        if(!p) {
            p = new ethers.providers.InfuraProvider(chainId, this.infuraKey);
            this.providers[chainId] = p;
        }
        return p;
    }
}