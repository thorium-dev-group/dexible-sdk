import { BigNumberish, ethers } from 'ethers';
import {abi, Token, chainConfig} from 'dexible-common';


export interface SpendingParams {
    token: Token;
    signer: ethers.Signer,
    amount: BigNumberish
}

export const increaseSpending = async(props:SpendingParams) : Promise<any> => {

    let provider = props.signer.provider;
    if(!provider) {
        throw new Error("Signer must have a provider");
    }
    let netInfo = await provider.getNetwork();
    let chainId = netInfo.chainId;
    let settle = chainConfig[chainId].Settlement;
    if(!settle) {
        throw new Error("Unsupported chain id: " + chainId);
    }

    let con = new ethers.Contract(props.token.address, abi.ERC20ABI, props.signer);
    return con.approve(settle, props.amount);
}