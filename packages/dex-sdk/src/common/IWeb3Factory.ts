import { ethers } from "ethers";

export interface IWeb3Factory {
    getProvider(chainId: number): Promise<ethers.providers.Provider>;
}