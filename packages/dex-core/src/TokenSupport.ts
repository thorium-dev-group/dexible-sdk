import * as TokenServices from 'dex-token';
import {Token} from 'dex-common';
import {BigNumberish, ethers} from 'ethers';

export interface ConstructorProps {
    signer: ethers.Signer;
    provider: ethers.providers.Provider;
}

export interface SpendIncreaseProps {
    token: Token;
    amount: BigNumberish;
}

const sleep = ms => new Promise(done=>setTimeout(done, ms));

export default class TokenSupport {

    signer: ethers.Signer;
    provider: ethers.providers.Provider;
    address: string | undefined;

    constructor(props:ConstructorProps) {
        this.signer = props.signer;
        this.provider = props.provider;
    }

    lookup = async (address:string): Promise<Token> => {
        if(!this.address) {
            this.address = await this.signer.getAddress();
        }
        return TokenServices.TokenFinder({
            address,
            owner: this.address,
            provider: this.provider
        });
    }

    increaseSpending = async (props:SpendIncreaseProps): Promise<any> => {
        let txn = await TokenServices.TokenUtils.increaseSpending({
            signer: this.signer,
            token: props.token,
            amount: props.amount
        });
        let r = await txn.wait();
        if(!r.status) {
            throw new Error("Allowance transaction failed");
        }
        //we pause for at least a block to give the network time to sync 
        //since we've just increased spending. Otherwise, any subsequent
        //check could result in order failure because allowance may not 
        //be visible to all nodes yet.
        await sleep(30000);

        return txn;
    }
}