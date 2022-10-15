import { ethers } from 'ethers';
import {
    APIClient,
    IAuthenticationHandler,
    IJWTHandler
} from '../client';
import { getNetwork } from '../common';
import { JwtAuthenticationHandler } from './auth/JwtAuthenticationHandler';
import { NullAuthenticationHandler } from './auth/NullAuthenticationHandler';
import { SignatureAuthenticationHandler } from './auth/SignatureAuthenticationHandler';
import { AuthService } from './auth/AuthService';

let inst: APIClientFactory | null = null;

export interface APIClientFactoryConfig {
    signer?: ethers.Signer;
    jwtHandler?: IJWTHandler;
    usingWalletConnect?: boolean;
    overrideDomain?: string;
}

export class APIClientFactory {
    jwtHandler?: IJWTHandler;
    isWalletConnect?: boolean;
    signer?: ethers.Signer;
    overrideDomain?: string;

    clients: {
        [k: number]: APIClient
    } = {};

    static get instance() {
        if(!inst) {
            inst = new APIClientFactory();
        }
        return inst;
    }

    configure(cfg: APIClientFactoryConfig) {
        //have to clear any previously configured clients
        this.clients = {};
        this.jwtHandler = cfg.jwtHandler;
        this.isWalletConnect = cfg.usingWalletConnect || false;
        this.signer = cfg.signer;
        this.overrideDomain = cfg.overrideDomain;
    }

    getClient(chainId: number): APIClient {
        let c = this.clients[chainId];
        if(!c) {
            const net = getNetwork(chainId);
            let authHandler: IAuthenticationHandler;
            if(!this.signer) {
                authHandler = new NullAuthenticationHandler();
            } else if(this.jwtHandler) {
                authHandler = new JwtAuthenticationHandler({
                    authService: new AuthService(chainId),
                    isWalletConnect: this.isWalletConnect!,
                    signer: this.signer,
                    tokenHandler: this.jwtHandler
                });
            } else {
                authHandler = new SignatureAuthenticationHandler({
                    authService: new AuthService(chainId),
                    isWalletConnect: this.isWalletConnect!,
                    signer: this.signer
                })
            }
            let baseUrl = `https://${net.apiDomain}/v1`;
            if(this.overrideDomain) {
                baseUrl = baseUrl.replace("api.dexible.io", this.overrideDomain);
            }
            c = new APIClient({
                authenticationHandler: authHandler,
                baseUrl
            });
            this.clients[chainId] = c;
        }
        return c;
    }
}