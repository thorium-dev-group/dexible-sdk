import { IAuthenticationHandler } from '../../client';
import { AxiosInstance, AxiosRequestConfig } from "axios";

export class NullAuthenticationHandler implements IAuthenticationHandler {

    public buildClient(clientProps: Partial<AxiosRequestConfig>): AxiosInstance {
        throw this.getMissingSignerError();
    }

    public async authenticate(): Promise<void> {
        throw this.getMissingSignerError();
    }

    protected getMissingSignerError(): Error {
        return new Error('Authentication not supported. Hint: ethers.Signer is required');
    }

}
