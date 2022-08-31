import { ethers, Signer } from 'ethers';
import {
    IJWTHandler,
    Services,
    MarketingUtils,
    MarketingProps,
    IAuthenticationHandler,
    APIExtensionProps,
    resolveApiEndpointByChainId,
} from 'dexible-common';

import { AlgoExtension } from './extension/algos';
import { QuoteExtension } from './extension/QuoteExtension';
import { ContactExtension } from './extension/ContactExtension';
import { ReportExtension } from './extension/ReportExtension';
import { GasPriceWrapper } from 'dexible-gas-prices';
import { TokenExtension } from './extension/TokenExtension';
import { OrderExtension } from './extension/OrderExtension';

import { AuthenticationExtension } from './extension/AuthenticationExtension';
import { JwtAuthenticationHandler } from './auth/JwtAuthenticationHandler'
import { SignatureAuthenticationHandler } from './auth/SignatureAuthenticationHandler';
import { NullAuthenticationHandler } from './auth/NullAuthenticationHandler';
import { BaseAuthenticationHandlerProps } from './auth/BaseAuthenticationHandler';

type WalletConnectionBase = {

    /**
     * Network Chain ID
     */
    chainId?: number;

    /**
     * Optional API endpoint
     */
    baseUrl?: string;

    /**
     * Optional JWT handler instance
     */
    jwtHandler?: IJWTHandler;

    /**
     * Gnosis Safe public address
     */
    gnosisSafe?: string;

    /**
     * WalletConnect support
     */
    isWalletConnect?: boolean;

    /**
     * Optional Custom session timeout (JWT only)
     */
    sessionTimeoutSeconds?: number;

    /**
     * Support automatic account registration (default: true)
     */
    autoRegisterUser?: boolean;

    /**
     * Marketing / Affiliate program data
     */
    marketing?: MarketingProps;
}

export type WalletConnectionWithProvider = WalletConnectionBase & {
    provider: ethers.providers.Provider;
}

export type WalletConnectionWithSigner = WalletConnectionBase & {
    /**
     * ethers.js Signer instance
     */
    signer?: Signer;

}

export type WalletConnectionWithInfura = WalletConnectionBase & {
    /**
     * An infura key to stand up a temporary provider
     */
    infuraKey: string;
}

export type WalletConnection = WalletConnectionWithProvider | WalletConnectionWithSigner | WalletConnectionWithInfura;


export default class SDK {

    provider: ethers.providers.Provider;
    signer?: ethers.Signer;

    gasPolicyTypes: {
        RELATIVE: string;
        FIXED: string;
    };

    apiClient: Services.APIClient;

    // configuration
    chainId: number;
    gnosisSafe?: string;
    marketing: MarketingProps;

    // endpoint extensions
    algo: AlgoExtension;
    contact: ContactExtension;
    authentication: AuthenticationExtension;
    gas: GasPriceWrapper;
    order: OrderExtension;
    quote: QuoteExtension;
    reports: ReportExtension;
    token: TokenExtension;


    static async create(props: WalletConnection): Promise<SDK> {
        let provider = 'provider' in props
            ? props.provider
            : undefined;


        const signer = 'signer' in props
            ? props.signer
            : undefined;

        const infuraKey = 'infuraKey' in props 
            ? props.infuraKey
            : undefined;

        if(!provider && !signer && !infuraKey) {
            throw new Error("Must supply a provider, signer, or infuraKey to create an SDK instance");
        }

        const specifiedChainId = props.chainId;

        if(infuraKey) {
            if(!specifiedChainId) {
                throw new Error("Must supply a chainId when using infura as a temporary provider");
            }
            provider = new ethers.providers.InfuraProvider(specifiedChainId, infuraKey);
            props = {
                ...props,
                provider
            } as WalletConnectionWithProvider;
        }
        

        const resolvedChainId = await SDK.resolveChainId({
            provider,
            signer,
        });

        if (specifiedChainId && resolvedChainId) {
            if (specifiedChainId !== resolvedChainId) {
                throw new Error(`Chain ID Mismatch (resolved: ${resolvedChainId}; specified: ${specifiedChainId})`);
            }
        }

        const chainId = specifiedChainId || resolvedChainId;

        return new SDK(props, chainId);
    }

    private constructor(props: WalletConnection, chainId: number) {

        const signer = 'signer' in props
            ? props.signer
            : undefined;
        this.signer = signer;

        const provider = 'provider' in props
            ? props.provider
            : signer?.provider;

        if (!provider) {
            throw new Error('provider is required');
        }
        this.provider = provider;

        const gnosisSafe = props.gnosisSafe;
        this.gnosisSafe = gnosisSafe;

        const baseUrl = props.baseUrl
            || resolveApiEndpointByChainId(chainId);

        this.chainId = chainId;

        this.gasPolicyTypes = {
            RELATIVE: "relative",
            FIXED: "fixed"
        };

        const marketing = MarketingUtils.extractMarketingProps(props.marketing || {});
        this.marketing = marketing;

        const authenticationHandler = SDK.buildAuthenticationHandler({
            sdk: this,
            walletConnection: props,
            marketing,
            signer,
        });

        const apiClient = new Services.APIClient({
            baseUrl,
            authenticationHandler,
        });
        this.apiClient = apiClient;

        const apiExtensionProps: APIExtensionProps = {
            apiClient,
            chainId,
            gnosisSafe,
            marketing,
            provider,
            signer,
        };

        // api extensions
        this.algo = new AlgoExtension(apiExtensionProps);
        this.authentication = new AuthenticationExtension(apiExtensionProps);
        this.contact = new ContactExtension(apiExtensionProps);
        this.gas = new GasPriceWrapper(this.apiClient);
        this.order = new OrderExtension(apiExtensionProps);
        this.quote = new QuoteExtension(apiExtensionProps);
        this.reports = new ReportExtension(apiExtensionProps);
        this.token = new TokenExtension(apiExtensionProps);
    }

    private static buildAuthenticationHandler(props: {
        marketing: any,
        sdk: SDK,
        signer?: ethers.Signer
        walletConnection: WalletConnection,
    }): IAuthenticationHandler {

        const {
            marketing,
            sdk,
            signer,
            walletConnection,
        } = props;

        // NOTE: AuthenticationHandler needs a reference to the sdk / authentication wrapper to
        // handle the authentication flow. Currently there is a coupling between
        // APIClient <--> AuthenticationHandler <--> AuthenticationWrapper to manage
        // registering, logging in, and refreshing automatically jwt tokens.
        let authenticationHandler;

        if (signer) {
            const authenticationHandlerProps: BaseAuthenticationHandlerProps = {
                autoRegisterUser: walletConnection.autoRegisterUser || true,
                isWalletConnect: walletConnection.isWalletConnect || false,
                sdk,
                signer,
                marketing,
            };

            if (walletConnection.jwtHandler) {
                authenticationHandler = new JwtAuthenticationHandler({
                    ...authenticationHandlerProps,
                    sessionTimeoutSeconds: walletConnection.sessionTimeoutSeconds,
                    tokenHandler: walletConnection.jwtHandler,
                });
            } else {
                authenticationHandler =
                    new SignatureAuthenticationHandler(
                        authenticationHandlerProps
                    );
            }
        } else {
            authenticationHandler = new NullAuthenticationHandler();
        }

        return authenticationHandler;
    }

    private static async resolveChainId(props: {
        provider?: ethers.providers.Provider,
        signer?: ethers.Signer,
    }): Promise<number> {

        // resolve provider chainId
        const provider = 'provider' in props
            ? props.provider
            : null;

        let providerChainId;
        if (provider) {
            providerChainId = (await provider.getNetwork()).chainId;
        }

        // resolve signer chainId
        const signer = 'signer' in props
            ? props.signer
            : null;

        let signerChainId;
        if (signer) {
            signerChainId = (await signer.provider?.getNetwork())?.chainId;
        }

        if (providerChainId && signerChainId) {
            if (providerChainId !== signerChainId) {
                throw new Error(`Chain ID Mismatch (provider: ${providerChainId}; signer:${signerChainId})`);
            }
        }

        return providerChainId || signerChainId;
    }

}
