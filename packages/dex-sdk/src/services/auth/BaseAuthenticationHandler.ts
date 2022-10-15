import { ethers } from 'ethers';
import { IAuthenticationHandler } from "../../client";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { AuthService } from './AuthService';

export interface BaseAuthenticationHandlerProps {
    isWalletConnect: boolean;
    signer: ethers.Signer;
    authService: AuthService;
}

export abstract class BaseAuthenticationHandler implements IAuthenticationHandler {

    autoRegisterUser: boolean = true;
    isWalletConnect: boolean;
    readonly signer: ethers.Signer;
    readonly authService: AuthService;
    jwtToken?: string;

    constructor(props: BaseAuthenticationHandlerProps) {
        const {
            isWalletConnect,
            signer,
            authService
        } = props;

        this.isWalletConnect = isWalletConnect;
        this.signer = signer;
        this.authService = authService;
    }

    public abstract buildClient(clientProps: Partial<AxiosRequestConfig>): AxiosInstance;

    public abstract authenticate() : Promise<void>;

    protected async signData(address: string, data: string): Promise<string> {
        let signature: string;
        if (this.isWalletConnect) {
            const p = this.signer.provider as any;
            signature = await p.send('personal_sign', [ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)), address.toLowerCase()]);
        } else {
            signature = await this.signer.signMessage(data);
        }
        return signature;
    }

}
