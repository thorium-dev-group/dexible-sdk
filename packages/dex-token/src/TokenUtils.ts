import { BigNumberish, BigNumber, ethers } from 'ethers';
import {abi, Token, chainConfig} from 'dexible-common';


const MIN_APPROVAL_GAS = BigNumber.from(75_000);
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
    let est = await con.estimateGas.approve(settle, props.amount);
    if(BigNumber.from(est).lt(MIN_APPROVAL_GAS)) {
        est = MIN_APPROVAL_GAS;
    }
    return con.approve(settle, props.amount, {
        gasLimit:est
    });
}