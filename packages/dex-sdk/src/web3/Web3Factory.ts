import {ethers} from 'ethers';
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

    async getProvider(chainId: number): Promise<ethers.providers.Provider> {
        let p = this.providers[+chainId];
        if(!p) {
            const net = getNetwork(chainId);
            p = new ethers.providers.JsonRpcProvider(net.rpcDomain);
            this.providers[chainId] = p;
        }
        return p;
    }
}