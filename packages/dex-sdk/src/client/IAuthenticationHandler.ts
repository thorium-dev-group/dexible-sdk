import { AxiosInstance, AxiosRequestConfig } from "axios";

export interface IAuthenticationHandler {
    buildClient: ((config: Partial<AxiosRequestConfig>) => AxiosInstance);
    authenticate: () => Promise<void>;
}
