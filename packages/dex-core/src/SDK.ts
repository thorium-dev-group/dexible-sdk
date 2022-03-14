import {ethers, Signer} from 'ethers';
import { AlgoWrapper} from './algos';
import TokenSupport from './TokenSupport';
import OrderWrapper from './OrderWrapper';
import {IJWTHandler, Services} from 'dexible-common';
import QuoteWrapper from './QuoteWrapper';
import Contact from './Contact';
import Reports from './Reports';
import Groups from './GroupAccounts';

export interface WalletConnection {
    network: 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'fantom';
    signer: Signer;
    jwtHandler?:IJWTHandler;
    gnosisSafe?:string;
    isWalletConnect?:boolean;
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
    chainId: number;
    reports: Reports;
    groups: Groups;

    static async create(props:WalletConnection):Promise<SDK> {
        let {signer} = props;
        let net = await signer.provider?.getNetwork();
        if(!net) {
            throw new Error("Signer does support a provider to retrieve network info");
        }
        return new SDK(props, net.chainId);
    }

    private constructor(props:WalletConnection, chainId: number) {
        this.signer = props.signer;
        this.provider = this.signer.provider;
        this.gnosisSafe = props.gnosisSafe;
        this.chainId = chainId;
        
        if(!this.provider) {
            throw new Error("Signer must have an ethers RPC provider");
        }
        this.apiClient = new Services.APIClient({
            network: props.network,
            signer: this.signer,
            chainId,
            jwtHandler: props.jwtHandler,
            isWalletConnect: props.isWalletConnect
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
        this.groups = new Groups(this.apiClient);
        
        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }

        this.reports = new Reports(this.apiClient);
    }

    setGroupId(id:number) {
        this.apiClient.setGroupId(id);
    }
}