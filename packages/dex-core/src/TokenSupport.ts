import * as TokenServices from 'dexible-token';
import {Token, Services} from 'dexible-common';
import {BigNumberish, ethers} from 'ethers';

export interface ConstructorProps {
    signer: ethers.Signer;
    provider: ethers.providers.Provider;
    apiClient: Services.APIClient;
    chainId: number;
}

export interface SpendIncreaseProps {
    token: Token;
    amount: BigNumberish;
}

const sleep = ms => new Promise(done=>setTimeout(done, ms));
const bn = ethers.BigNumber.from;

export default class TokenSupport {

    signer: ethers.Signer;
    provider: ethers.providers.Provider;
    address: string | undefined;
    apiClient: Services.APIClient;
    chainId: number;

    constructor(props:ConstructorProps) {
        this.signer = props.signer;
        this.provider = props.provider;
        this.apiClient = props.apiClient;
        this.chainId = props.chainId;
    }

    lookup = async (address:string): Promise<Token> => {
        let r = await this.verify(address);
        if(!r || r.error) {
            throw new Error("Unsupported token address:" + address);
        }
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
        let network = await this.signer.provider?.getNetwork();
        if(network?.chainId !== this.chainId) {
            throw new Error("Provided signer's chainId does not match SDK's chainId");
        }
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
        props.token.allowance = bn(props.amount);
        return txn;
    }

    verify = async (address:string) => {
        return this.apiClient.get(`token/verify/${this.chainId}/${address}`);
    }
}