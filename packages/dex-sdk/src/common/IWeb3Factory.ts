import { ethers } from "ethers";

/**
 * To abstract where ethers providers come from, external integrations
 * must supply the Dexible SDK with a way to create a provider for any
 * supported chain. This allows anyone to supply a provider of their
 * choice that the SDK will use for token lookups, etc.
 */
export interface IWeb3Factory {
    /**
     * Given a chain id, supply a Provider impl
     * 
     * @param chainId 
     */
    getProvider(chainId: number): Promise<ethers.providers.Provider>;
}