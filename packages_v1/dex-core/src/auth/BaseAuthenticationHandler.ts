import { ethers } from 'ethers';
import { MarketingProps } from 'dexible-common';
import SDK from "../SDK";
import { IAuthenticationHandler } from "dexible-common/src/services/IAuthenticationHandler";
import { AxiosInstance, AxiosRequestConfig } from "axios";

export interface BaseAuthenticationHandlerProps {
    autoRegisterUser: boolean;
    isWalletConnect: boolean;
    marketing?: MarketingProps;
    sdk: SDK;
    signer: ethers.Signer;
}

export abstract class BaseAuthenticationHandler implements IAuthenticationHandler {

    autoRegisterUser: boolean;
    isWalletConnect: boolean;
    marketing?: MarketingProps;
    sdk: SDK;
    signer: ethers.Signer;
    token?: string;

    constructor(props: BaseAuthenticationHandlerProps) {
        const {
            autoRegisterUser,
            isWalletConnect,
            marketing,
            sdk,
            signer,
        } = props;

        this.autoRegisterUser = autoRegisterUser;
        this.isWalletConnect = isWalletConnect;
        this.marketing = marketing;
        this.sdk = sdk;
        this.signer = signer;
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
