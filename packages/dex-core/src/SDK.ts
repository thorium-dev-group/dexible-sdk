import { ethers, Signer } from 'ethers';
import { AlgoWrapper } from './algos';
import TokenSupport from './TokenSupport';
import OrderWrapper from './OrderWrapper';
import {
    IJWTHandler,
    Services,
    MarketingUtils,
    MarketingProps,
} from 'dexible-common';
import QuoteWrapper from './QuoteWrapper';
import Contact from './Contact';
import Reports from './Reports';
import { JwtAuthenticationHandler } from './JwtAuthenticationHandler'
import { SignatureAuthenticationHandler } from './SignatureAuthenticationHandler';

import { AuthenticationWrapper } from './AuthenticationWrapper';

export interface WalletConnection {
    /**
     * Human-readable network name
     */
    network: 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'fantom';

    /**
     * Optional API endpoint
     */
    baseUrl?: string;

    /**
     * ethers.js Signer instance
     */
    signer: Signer;

    /**
     * Optional JWT handler instance
     */
    jwtHandler?: IJWTHandler;

    /**
     * 
     */
    gnosisSafe?: string;

    /**
     * 
     */
    isWalletConnect?: boolean;

    sessionTimeout?: number;

    marketing?: MarketingProps;
}


export default class SDK {

    provider: ethers.providers.Provider | undefined;
    signer: ethers.Signer;
    gasPolicyTypes: {
        RELATIVE: string;
        FIXED: string;
    };
    algo: AlgoWrapper;
    authentication: AuthenticationWrapper;
    token: TokenSupport;
    order: OrderWrapper;
    apiClient: Services.APIClient;
    quote: QuoteWrapper;
    contact: Contact;
    gnosisSafe?: string;
    chainId: number;
    reports: Reports;

    // Marketing Data
    marketing: MarketingProps;

    static async create(props: WalletConnection): Promise<SDK> {
        let { signer } = props;
        let net = await signer.provider?.getNetwork();
        if (!net) {
            throw new Error("Signer does support a provider to retrieve network info");
        }
        return new SDK(props, net.chainId);
    }

    private constructor(props: WalletConnection, chainId: number) {
        this.signer = props.signer;
        this.provider = this.signer.provider;
        this.gnosisSafe = props.gnosisSafe;
        this.chainId = chainId;

        this.marketing = MarketingUtils.extractMarketingProps(props.marketing || {});

        if (!this.provider) {
            throw new Error("Signer must have an ethers RPC provider");
        }

        // NOTE: AuthenticationHandler needs a reference to the sdk / authentication wrapper to
        // handle the authentication flow. Currently there is a coupling between
        // APIClient <--> AuthenticationHandler <--> AuthenticationWrapper to manage
        // registering, logging in, and refreshing automatically jwt tokens.
        let authenticationHandler;
        if (props.jwtHandler) {
            authenticationHandler = new JwtAuthenticationHandler({
                isWalletConnect: props.isWalletConnect || false,
                sdk: this,
                signer: this.signer,
                tokenHandler: props.jwtHandler,
                marketing: this.marketing,
            })
        } else {
            authenticationHandler = new SignatureAuthenticationHandler({
                isWalletConnect: props.isWalletConnect || false,
                sdk: this,
                signer: this.signer,
                marketing: this.marketing,
            })
        }

        // jwtHandler: props.jwtHandler,

        this.apiClient = new Services.APIClient({
            baseUrl: props.baseUrl,
            network: props.network,
            chainId,
            authenticationHandler,
        });

        this.algo = new AlgoWrapper();
        this.token = new TokenSupport({
            provider: this.provider,
            signer: this.signer,
            apiClient: this.apiClient,
            gnosisSafe: this.gnosisSafe
        });

        this.authentication = new AuthenticationWrapper(this.apiClient);
        this.order = new OrderWrapper(this.apiClient, this.gnosisSafe, this.marketing);
        this.quote = new QuoteWrapper(this.apiClient, this.marketing);
        this.contact = new Contact({ apiClient: this.apiClient });

        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        }

        this.reports = new Reports(this.apiClient);
    }
}
