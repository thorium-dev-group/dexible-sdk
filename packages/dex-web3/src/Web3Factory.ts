import {ethers} from 'ethers';

export interface Web3FactoryProps {
    chainId: number;
    network: string;
    infuraKey?: string;
}

const providers = {};

export const ETHEREUM = "ethereum";

export default async (props:Web3FactoryProps):Promise<ethers.providers.Provider> => {

    if(props.network.toLowerCase() !== 'ethereum') {
        throw new Error("Only ethereum network supported in this release");
    } 

    let p = providers[props.chainId];
    if(!p) {
        p = new ethers.providers.InfuraProvider(props.chainId, props.infuraKey);
        providers[props.chainId] = p;
    }
    return p;
}