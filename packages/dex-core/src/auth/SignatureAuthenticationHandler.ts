import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IAuthenticationHandler } from "dexible-common/src/services/IAuthenticationHandler";
import { BaseAuthenticationHandler } from "./BaseAuthenticationHandler";
import { EthHttpSignatureAxiosAdapter } from 'dexible-eth-http-signatures';
import Logger from "dexible-logger";

const log = new Logger({ component: "SignatureAuthenticationHandler" });

export class SignatureAuthenticationHandler extends BaseAuthenticationHandler implements IAuthenticationHandler {

    public buildClient(clientProps: Partial<AxiosRequestConfig>): AxiosInstance {
        if (!this.signer) {
            throw new Error(`ethers.Signer is required for authentication`);
        }
        const adapter = EthHttpSignatureAxiosAdapter.build(this.signer);

        const httpClient = axios.create({
            ...clientProps,
            adapter,
        });

        return httpClient;
    }

    public async authenticate(): Promise<void> {
        await this.registerOrLogin();
    }

    /**
     * 
     * @param attemptCount
     * @returns 
     */
    protected async registerOrLogin(): Promise<void> {

        let loginSuccess = await this.login();

        if (loginSuccess == false && this.autoRegisterUser) {
            await this.register();
            
            // second login attempt
            loginSuccess = await this.login();
        }

        if (! loginSuccess) {
            throw new Error(`Account registration is required`);
        }
    }

    protected async register(): Promise<void> {
        const address = await this.signer.getAddress();

        log.debug("Must first register wallet before login");
        try {
            await this.sdk.authentication.register({
                address,
                marketing: this.marketing,
            });
        } catch (e) {
            log.error({ err: e }, "Problem registering user");
            throw e;
        }
    }

    protected async login(): Promise<boolean> {
        let isAuthenticated = false;
        try {
            const response = await this.sdk.authentication.status();
            isAuthenticated = response.authenticated;
        } catch (e) {
            log.error({ err: e }, "Problem getting auth status");
            throw e;
        }
        return isAuthenticated;
    }

}
