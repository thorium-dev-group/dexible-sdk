import { ethers } from "ethers";
import { IWeb3Factory } from "../src/common/IWeb3Factory";

export class StaticWeb3Factory implements IWeb3Factory {
    authKey: string;
    providers: {
        [k: number]: ethers.providers.StaticJsonRpcProvider
    } = {};

    constructor() {
        const authKey = process.env.JSON_RPC_KEY;
        if(!authKey) {
            throw new Error("Missing JSON_RPC_KEY in env");
        }
        this.authKey = authKey;
    }
    async getProvider(chainId: number): Promise<ethers.providers.Provider> {
        let p = this.providers[chainId];
        if(!p) {
            const url = process.env[`RPC_URL_${chainId}`];
            if(!url) {
                throw new Error("Unsupported network " + chainId);
            }
            const headers = {
                Authorization: `Bearer ${this.authKey}`
            }
            p = new ethers.providers.StaticJsonRpcProvider({
                url,
                headers
            });
            this.providers[chainId] = p;
        }
        
        return p;
    }
}