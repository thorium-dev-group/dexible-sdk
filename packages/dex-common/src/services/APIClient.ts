import axios, { AxiosAdapter, AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import Logger from 'dexible-logger';
import chainToName from '../chainToName';
import SDKError from '../SDKError';
import { default as axiosRetry, isIdempotentRequestError, isNetworkError } from 'axios-retry';
import { IAuthenticationHandler } from './IAuthenticationHandler';

const log = new Logger({ component: "APIClient" });

const DEFAULT_BASE_ENDPOINT = "api.dexible.io/v1";

export type NetworkName = "ethereum" | "polygon" | "avalanche" | "bsc" | "fantom";
export interface APIProps {
    chainId: number;
    baseUrl?: string;
    network: NetworkName;
    signer?: ethers.Signer;
    authenticationHandler: IAuthenticationHandler;
}

export interface RequestParams {
    data?: {
        [key: string]: any
    };
    headers?: {
        [key: string]: string
    };
    endpoint: string;
    requiresAuthentication: boolean;
};

export type AuthenticationMode = 'jwt' | 'signature' | 'none';

export class APIClient {

    adapter: AxiosAdapter | null;
    baseUrl: string;
    chainId: number;
    chainName: string | null;

    httpClients: Record<string, AxiosInstance>

    authenticationHandler?: IAuthenticationHandler;
    network: NetworkName;
    signer?: ethers.Signer;

    retryDelay = 100;
    shouldResetTimeout = false;
    retryCount = 3;

    headers: any;

    // TODO: Add Timeout

    constructor(props: APIProps) {

        this.signer = props.signer;
        this.adapter = null;
        this.network = props.network;
        this.chainId = props.chainId;
        this.chainName = chainToName(this.network, this.chainId);
        this.baseUrl = props.baseUrl || this.buildBaseUrl();
        this.authenticationHandler = props.authenticationHandler;
        this.headers = {};

        this.httpClients = {};

        log.debug("Created api client for chain",
            this.chainName,
            "on network",
            this.network);
    }

    /**
     * 
     * @param endpoint 
     * @returns 
     */
    public async get(endpointOrParams: string | RequestParams): Promise<any> {

        const params = this.normalizeParams(endpointOrParams);

        let url = `${this.baseUrl}/${params.endpoint}`;
        log.debug("GET call to", url);

        const httpClient = await this.getHttpClient(params.requiresAuthentication);

        const response = await httpClient.request({
            headers: params.headers,
            method: "GET",
            url,
        });

        return response.data;
    }


    /**
     * 
     * @param endpoint 
     * @param data 
     * @returns 
     */
    public async post(endpointOrParams: string | RequestParams, maybeData?: object | undefined) {

        const params = this.normalizeParams(endpointOrParams, maybeData);

        let url = `${this.baseUrl}/${params.endpoint}`;
        log.debug("Posting to url", url);

        const httpClient = await this.getHttpClient(params.requiresAuthentication);

        const response = await httpClient.request({
            data: params.data,
            headers: params.headers,
            method: "POST",
            url,
        });

        return response.data;
    }


    /**
     * 
     * @returns 
     */
    protected buildBaseUrl() {
        let base = process.env.API_BASE_URL;
        if (!base) {
            base = `https://${this.network}.${this.chainName}.${DEFAULT_BASE_ENDPOINT}`
        }
        return base;
    }


    protected async getHttpClient(requiresAuthentication: boolean): Promise<AxiosInstance> {

        const key = requiresAuthentication
            ? 'authenticated'
            : 'unauthenticated';


        if (this.httpClients[key]) {
            return this.httpClients[key];
        }

        let httpClient: AxiosInstance;
        if (requiresAuthentication) {

            if (! this.authenticationHandler) {
                throw new Error(`AuthenticationHandler is required`);
            }

            httpClient = this.authenticationHandler.buildClient({
                baseURL: this.baseUrl,
                headers: this.headers,
            });

            // handle registration & initial login
            await this.authenticationHandler.authenticate();
        } else {
            httpClient = axios.create({
                baseURL: this.baseUrl,
                headers: this.headers,
            });
        }

        // error handling
        httpClient.interceptors.response.use(
            (response) => {
                // throw on API error response, regardless of status code
                this.throwOnResponseErrorData(response);
                return response;
            },
            (err) => {
                log.error({ err, msg: "Problem in API post" });
                this.throwOnAxiosError(err);
            }
        )

        // TODO
        // enable request limit support
        // httpClient.interceptors.request.use(async (config) => {
        //     if (this.limiter) {
        //         if (!this.limiter.tryRemoveTokens(1)) {
        //             this.log.warn("hit rate limit, waiting to make request");
        //             await this.limiter.removeTokens(1);
        //         }
        //     }
        //     return config;
        // });

        // retry support
        axiosRetry(httpClient, {
            retryDelay: (this.retryDelay as any),
            shouldResetTimeout: this.shouldResetTimeout,
            retries: this.retryCount,
            retryCondition: (error) => {
                const shouldRetry = axiosRetry.isNetworkOrIdempotentRequestError(error);
                log.debug({
                    err: error.message,
                    msg: shouldRetry ? "retrying query" : "giving up on query",
                });
                return shouldRetry;
            },
        });

        this.httpClients[key] = httpClient;

        return httpClient;
    }


    /**
     * 
     * @param endpointOrParams 
     * @param data 
     * @returns 
     */
    protected normalizeParams(endpointOrParams: string | RequestParams, data?: object): RequestParams {
        const normalized: RequestParams = typeof endpointOrParams === 'string'
            ? { endpoint: endpointOrParams, data, requiresAuthentication: true, }
            : endpointOrParams;

        return normalized;
    }

    /**
     * 
     * @param err 
     */
    protected throwOnAxiosError(err: AxiosError): void {

        const message = err.message;
        const response = err.response;
        log.error("Problem from server", response?.data);

        if (typeof response?.data === 'object') {
            this.throwOnResponseErrorData(response);
        }

        let data: any;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(response?.data);
            } catch (e) {
                data = response?.data;
            }
        }

        const requestId = data?.requestId;

        throw new SDKError({
            data,
            message,
            requestId,
        });
    }

    /**
     * 
     * @param response 
     */
    protected throwOnResponseErrorData(response: AxiosResponse): void {
        let data: any;

        if (!response.data) {
            throw new SDKError({
                message: "Missing result in get request"
            });
        }

        if (typeof response.data === 'string') {
            try {
                data = JSON.parse(response.data);
            } catch (e) {
                data = response.data;
            }
        }

        if (response.data.error) {
            log.error("Problem reported from server", response.data.error);

            const err = data.error;

            const message = err.message
                ? err.message
                : err;

            const code = err.code;

            const requestId = err.requestId;

            throw new SDKError({
                code,
                data,
                message,
                requestId,
            });
        }
    }

}

export default APIClient;
