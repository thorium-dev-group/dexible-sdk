import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IAuthenticationHandler } from "../../client";
import { BaseAuthenticationHandler } from "./BaseAuthenticationHandler";
import { EthHttpSignatureAxiosAdapter } from '../../http_signatures';
import Logger from "../../logger";

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

    protected async registerOrLogin(): Promise<void> {

        try {
            await this.login();
        } catch (e) {
            if (this.autoRegisterUser) {
                await this.register();

                // second login attempt
                await this.login();
            } else {
                throw new Error(`Account registration is required`);
            }
        }
    }

    protected async register(): Promise<void> {
        const address = (await this.signer.getAddress()).toLowerCase();

        log.debug("Must first register wallet before login");
        try {
            await this.authService.register({
                address,
            });
        } catch (e) {
            log.error({ err: e }, "Problem registering user");
            throw e;
        }
    }

    protected async login(): Promise<boolean> {
        let isAuthenticated = false;
        try {
            const response = await this.authService.status();
            isAuthenticated = response.authenticated;
        } catch (e) {
            log.error({ err: e }, "Problem getting auth status");
            throw e;
        }
        return isAuthenticated;
    }

}
