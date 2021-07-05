import * as TokenServices from 'dex-token';
import {BigNumberish, ethers} from 'ethers';

export interface ConstructorProps {
    wallet: ethers.Wallet;
    provider: ethers.providers.Provider;
}

export interface SpendIncreaseProps {
    token: TokenServices.Token;
    amount: BigNumberish;
}

const sleep = ms => new Promise(done=>setTimeout(done, ms));

export default class TokenSupport {

    wallet: ethers.Wallet;
    provider: ethers.providers.Provider;

    constructor(props:ConstructorProps) {
        this.wallet = props.wallet;
        this.provider = props.provider;
    }

    lookup = async (address:string): Promise<TokenServices.Token> => {
        return TokenServices.TokenFinder({
            address,
            owner: this.wallet.address,
            provider: this.provider
        });
    }

    increaseSpending = async (props:SpendIncreaseProps): Promise<any> => {
        let txn = await TokenServices.TokenUtils.increaseSpending({
            wallet: this.wallet,
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
        await sleep(15000);

        return txn;
    }
}