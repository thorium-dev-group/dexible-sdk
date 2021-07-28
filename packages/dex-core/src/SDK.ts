import {ethers, Signer} from 'ethers';
import { AlgoWrapper} from './algos';
import TokenSupport from './TokenSupport';
import OrderWrapper from './OrderWrapper';
import {IJWTHandler, Services} from 'dexible-common';
import QuoteWrapper from './QuoteWrapper';
import Contact from './Contact';


export interface WalletConnection {
    network: 'ethereum'; //for now only ethereum
    signer: Signer;
    jwtHandler?:IJWTHandler;
    gnosisSafe?:string;
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
    contact: Contact;
    gnosisSafe?: string;

    constructor(props:WalletConnection) {
        this.signer = props.signer;
        this.provider = this.signer.provider;
        this.gnosisSafe = props.gnosisSafe;

        
        if(!this.provider) {
            throw new Error("Signer must have an ethers RPC provider");
        }
        this.apiClient = new Services.APIClient({
            network: props.network,
            signer: this.signer,
            jwtHandler: props.jwtHandler
        });
       
        this.algo = new AlgoWrapper();
        this.token = new TokenSupport({
            provider: this.provider,
            signer: this.signer,
            apiClient: this.apiClient,
            gnosisSafe: this.gnosisSafe
        });
        
        this.order = new OrderWrapper(this.apiClient, this.gnosisSafe);
        this.quote = new QuoteWrapper(this.apiClient);
        this.contact = new Contact({apiClient: this.apiClient});
        
        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }
    }
}