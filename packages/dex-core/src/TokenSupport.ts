import * as TokenServices from 'dex-token';
import {BigNumberish, ethers, Transaction} from 'ethers';

export interface ConstructorProps {
    wallet: ethers.Wallet;
    provider: ethers.providers.Provider;
}

export interface SpendIncreaseProps {
    token: TokenServices.Token;
    amount: BigNumberish;
}

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
        return TokenServices.TokenUtils.increaseSpending({
            wallet: this.wallet,
            token: props.token,
            amount: props.amount
        });
    }
}