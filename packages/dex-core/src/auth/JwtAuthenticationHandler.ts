import { AuthNonceResponse } from "../extension/AuthenticationExtension";
import Logger from "dexible-logger";
import { IJWTHandler, IAuthenticationHandler } from 'dexible-common';
import { BaseAuthenticationHandler, BaseAuthenticationHandlerProps } from "./BaseAuthenticationHandler";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { ethers } from "ethers";


const log = new Logger({ component: "JwtSessionHandler" });

type LoginDetails = { token: string, expiration: number };

export interface JwtSessionHandlerProps extends BaseAuthenticationHandlerProps {
    signer: ethers.Signer;
    tokenHandler: IJWTHandler;
    sessionTimeoutSeconds?: number;
};

export class JwtAuthenticationHandler extends BaseAuthenticationHandler implements IAuthenticationHandler {

    sessionTimeoutSeconds?: number;
    tokenHandler: IJWTHandler;

    constructor(props: JwtSessionHandlerProps) {
        super(props);

        const {
            sessionTimeoutSeconds,
            tokenHandler,
        } = props;

        this.sessionTimeoutSeconds = sessionTimeoutSeconds;
        this.tokenHandler = tokenHandler;
    }

    public buildClient(clientProps: Partial<AxiosRequestConfig>): AxiosInstance {

        const httpClient = axios.create(clientProps);

        if (!this.signer) {
            throw new Error('ethers.Signer is required for JWT authentication');
        }

        // enable auth-token refresh support
        createAuthRefreshInterceptor(httpClient, async (failedRequest) => {
            await this.authenticate();
        });

        // inject auth header
        httpClient.interceptors.request.use(async (request) => {
            request.headers['Authorization'] = `Bearer ${this.getToken()}`;
            return request;
        });

        return httpClient;
    }

    public async authenticate(): Promise<void> {
        await this.registerOrLogin();
    }

    protected async getToken(): Promise<string> {
        let token = await this.tokenHandler.readToken();

        if (!token) {
            const response = await this.registerOrLogin();
            token = response.token;
        }

        return token;
    }

    /**
     * 
     * @param attemptCount
     * @returns 
     */
    protected async registerOrLogin(): Promise<LoginDetails> {

        let response: LoginDetails;
        try {
            response = await this.login();
        } catch (e) {
            // attempt user registration
            if (this.autoRegisterUser) {
                await this.register();

                // second login attempt
                response = await this.login();
            } else {
                throw e;
            }
        }

        return response;
    }

    protected async login(): Promise<LoginDetails> {

        log.debug("Generating JWTToken...");
        const address = await this.signer.getAddress();

        let nonceResponse: AuthNonceResponse;
        try {
            nonceResponse = await this.sdk.authentication.nonce({
                address,
            });

        } catch (e) {
            log.error({ err: e }, "Problem getting signing nonce");
            throw e;
        }

        // needs to register
        if (!nonceResponse.canLogin) {
            throw new Error("Could not get nonce on second attempt");
        }

        // sign nonce
        log.debug("Have signable nonce for login...");
        let signature = await this.signData(address, nonceResponse.nonce);

        // login
        log.debug("Signed nonce, submitting for login");
        const loginResponse = await this.sdk.authentication.login({
            signature,
            address,
            nonce: nonceResponse.nonce,
            expiresInSeconds: this.sessionTimeoutSeconds,
        });

        log.debug("Received token", loginResponse.token);
        await this.tokenHandler?.storeToken(loginResponse.token, loginResponse.expiration);

        return {
            token: loginResponse.token,
            expiration: loginResponse.expiration,
        };
    }

    protected async register() {
        const address = await this.signer.getAddress();
        try {
            const response = await this.sdk.authentication.register({
                address,
                marketing: this.marketing,
            });
        } catch (e) {
            log.error({ err: e }, "Problem registering user");
            throw e;
        }
    }

}
