import { BigNumberish, BigNumber, ethers } from 'ethers';
import {abi, Token, chainConfig} from 'dexible-common';
import { ContractFactory } from 'dexible-pot-lib';


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
    const dexible = await ContractFactory.getDexible(provider);
    if(!dexible || !dexible.address) {
        throw new Error(`Could not resolve Dexible address on network: ${chainId}`);
    }

    let con = new ethers.Contract(props.token.address, abi.ERC20ABI, props.signer);
    let est = await con.estimateGas.approve(dexible.address, props.amount);
    if(BigNumber.from(est).lt(MIN_APPROVAL_GAS)) {
        est = MIN_APPROVAL_GAS;
    }
    return con.approve(dexible.address, props.amount, {
        gasLimit:est
    });
}