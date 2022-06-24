import * as TokenServices from 'dexible-token';
import {
    APIClient,
    APIExtensionProps,
    Token
} from 'dexible-common';
import {BigNumberish, ethers} from 'ethers';

export interface SpendIncreaseProps {
    token: Token;
    amount: BigNumberish;
}

const sleep = ms => new Promise(done=>setTimeout(done, ms));
const bn = ethers.BigNumber.from;

export class TokenExtension {

    apiClient: APIClient;
    chainId: number;
    gnsosisSafe?: string;
    provider: ethers.providers.Provider;
    signer?: ethers.Signer;
    signerAddress: string | undefined;

    constructor(props: APIExtensionProps) {
        this.signer = props.signer;
        this.provider = props.provider;
        this.apiClient = props.apiClient;
        this.gnsosisSafe = props.gnosisSafe;
        this.chainId = 0;
    }

    protected getSigner() : ethers.Signer {
        const signer = this.signer;
        if (! signer) {
            throw new Error('ethers.Signer is required');
        }
        return signer;
    }

    protected async getSignerAddress() : Promise<string> {
        const signer = this.getSigner();
        let signerAddress = this.gnsosisSafe || this.signerAddress;

        if (! this.signerAddress) {
            signerAddress = await signer.getAddress();
            this.signerAddress = signerAddress;
        }

        if (! signerAddress) {
            throw new Error('Failed to resolve Signer address');
        }

        this.signerAddress = signerAddress;

        return signerAddress;
    }

    async lookup(address:string): Promise<Token> {
        let r = await this.verify(address);
        if(!r || r.error) {
            throw new Error("Unsupported token address:" + address);
        }
        const owner = await this.getSignerAddress();

        return TokenServices.TokenFinder({
            address,
            owner,
            provider: this.provider
        });
    }

    async increaseSpending(props:SpendIncreaseProps): Promise<any> {
        const signer = await this.getSigner();

        const network = await signer.provider?.getNetwork();
        this.chainId = network?.chainId || 0;
        if(!this.chainId) {
            throw new Error("Signer does not have a web3 provider to supply network info");
        }
        
        if(this.gnsosisSafe) {
            throw new Error("Cannot increase spending for a GnosisSafe. Must do that through GnosisSafe app with owner approvals");
        }
        
        let txn = await TokenServices.TokenUtils.increaseSpending({
            signer,
            token: props.token,
            amount: props.amount
        });
        let r = await txn.wait();
        if(!r.status) {
            throw new Error("Allowance transaction failed");
        }

        // TODO: discuss w. @mdcoon
        //we pause for at least a block to give the network time to sync 
        //since we've just increased spending. Otherwise, any subsequent
        //check could result in order failure because allowance may not 
        //be visible to all nodes yet.
        await sleep(30000);
        props.token.allowance = bn(props.amount);
        return txn;
    }

    async verify(address:string) {

        if (this.chainId === 0) {
            let net = await this.provider.getNetwork();
            this.chainId = net.chainId;
        }

        const endpoint = `token/verify/${this.chainId}/${address}`;

        return this.apiClient.get({
            endpoint,
            requiresAuthentication: false,
            withRetrySupport: true,
        });
    }
}
