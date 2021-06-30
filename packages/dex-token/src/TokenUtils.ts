import { BigNumberish, ethers, Transaction } from 'ethers';
import {Token} from './TokenFinder';
import {abi, chainConfig} from 'dex-common';


export interface SpendingParams {
    token: Token;
    wallet: ethers.Wallet,
    amount: BigNumberish
}

export const increaseSpending = async(props:SpendingParams) : Promise<any> => {

    let netInfo = await props.wallet.provider.getNetwork();
    let chainId = netInfo.chainId;
    let settle = chainConfig[chainId].Settlement;
    if(!settle) {
        throw new Error("Unsupported chain id: " + chainId);
    }

    let con = new ethers.Contract(props.token.address, abi.ERC20ABI, props.wallet);
    return con.approve(settle, props.amount);
}