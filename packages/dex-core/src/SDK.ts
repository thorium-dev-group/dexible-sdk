import {ethers, Signer} from 'ethers';
import { AlgoWrapper} from './algos';
import TokenSupport from './TokenSupport';
import OrderWrapper from './OrderWrapper';
import {Services} from 'dex-common';
import QuoteWrapper from './QuoteWrapper';

export interface WalletConnection {
    network: 'ethereum'; //for now only ethereum
    chainId: number;
    signer: Signer;
}

export default class SDK {

    provider: ethers.providers.Provider|undefined;
    signer: ethers.Signer;
    gasPolicyTypes: {
        RELATIVE: string;
        FIXED: string;
    };
    algo: AlgoWrapper;
    token: TokenSupport;
    order: OrderWrapper;
    apiClient: Services.APIClient;
    quote: QuoteWrapper;

    constructor(props:WalletConnection) {
        this.signer = props.signer;
        this.provider = this.signer.provider;
        if(!this.provider) {
            throw new Error("Signer must have an ethers RPC provider");
        }
       
        this.algo = new AlgoWrapper();
        this.token = new TokenSupport({
            provider: this.provider,
            signer: this.signer
        });
        this.apiClient = new Services.APIClient({
            chainId: props.chainId,
            network: props.network,
            signer: this.signer
        });
        this.order = new OrderWrapper(this.apiClient);
        this.quote = new QuoteWrapper(this.apiClient);
        
        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }
    }
}