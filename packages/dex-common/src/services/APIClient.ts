import axios, { AxiosAdapter, AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Logger from 'dexible-logger';
import SDKError from '../SDKError';
import { default as axiosRetry, isIdempotentRequestError, isNetworkError } from 'axios-retry';
import { IAuthenticationHandler } from './IAuthenticationHandler';


const log = new Logger({ component: "APIClient" });

export type HttpClientOptions = {
    requiresAuthentication: boolean;
    withRetrySupport: boolean;
}

export type NetworkName = "ethereum" | "polygon" | "avalanche" | "bsc" | "fantom";
export interface APIProps {
    authenticationHandler: IAuthenticationHandler;
    baseUrl: string;
    // chainId: number;
    // network: NetworkName;
    retryCount?: number;
    retryDelayBaseMs?: number;
    timeoutMs?: number;
    customBackoff?: (retryCount: number) => number;
}

export interface RequestParams {
    data?: {
        [key: string]: any
    };
    endpoint: string;
    headers?: {
        [key: string]: string
    };
    params?: {
        [key: string]: any
    };
    requiresAuthentication: boolean;
    withRetrySupport: boolean;
};

export type AuthenticationMode = 'jwt' | 'signature' | 'none';


export class APIClient {

    static defaults = {
        retryCount: 3,
        retryDelayMs: 100,
        timeout: 30_000,
    };

    adapter: AxiosAdapter | null;
    baseUrl: string;

    httpClients: Record<string, AxiosInstance>

    authenticationHandler?: IAuthenticationHandler;
    // network: NetworkName;

    retryDelayBaseMs = 100;
    retryCount = 3;

    shouldResetTimeout = false;

    headers: any;

    timeoutMs = 10_000;

    customBackoff?: (retryCount: number) => number;

    constructor(props: APIProps) {

        this.adapter = null;
        // this.network = props.network;
        this.baseUrl = props.baseUrl;
        this.authenticationHandler = props.authenticationHandler;
        this.headers = {};

        this.retryCount = typeof props.retryCount === 'number'
            ? props.retryCount
            : APIClient.defaults.retryCount;

        this.retryDelayBaseMs = typeof props.retryDelayBaseMs === 'number'
            ? props.retryDelayBaseMs
            : APIClient.defaults.retryDelayMs;

        this.timeoutMs = typeof props.timeoutMs === 'number'
            ? props.timeoutMs
            : APIClient.defaults.timeout;

        this.customBackoff = props.customBackoff;


        this.httpClients = {};

        log.debug("Created api client for " + this.baseUrl);
    }

    protected calculateRetryDelay(retryCount: number): number {
        const jitter = Math.random();
        const exponentialBackoff = Math.pow(2, retryCount) * this.retryDelayBaseMs
        const delay = Math.floor(jitter * exponentialBackoff);
        return delay;
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

        const httpClient = await this.getHttpClient({
            requiresAuthentication: params.requiresAuthentication,
            withRetrySupport: params.withRetrySupport,
        });

        log.debug({
            msg: 'GET request',
            url,
            ...params,
        });

        const response = await httpClient.request({
            data: params.data,
            params: params.params,
            headers: params.headers,
            method: "GET",
            url,
        });

        log.debug({
            msg: 'GET response',
            response,
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

        const httpClient = await this.getHttpClient({
            requiresAuthentication: params.requiresAuthentication,
            withRetrySupport: params.withRetrySupport,
        });

        log.debug({
            msg: 'POST request',
            url,
            ...params,
        });

        const response = await httpClient.request({
            data: params.data,
            headers: params.headers,
            method: "POST",
            url,
        });

        log.debug({
            msg: 'POST response',
            response,
        });

        return response.data;
    }

    protected async getHttpClient(props: HttpClientOptions): Promise<AxiosInstance> {

        const {
            requiresAuthentication,
            withRetrySupport,
        } = props;

        const key = [
            `requiresAuthentication:${Boolean(requiresAuthentication)}`,
            `withRetrySupport:${Boolean(withRetrySupport)}`,
        ].join(';');

        if (this.httpClients[key]) {
            return this.httpClients[key];
        }

        let httpClient: AxiosInstance;

        const clientConfig: AxiosRequestConfig = {
            baseURL: this.baseUrl,
            headers: this.headers,
            timeout: this.timeoutMs,
        }

        if (requiresAuthentication) {

            if (!this.authenticationHandler) {
                throw new SDKError({
                    message: `AuthenticationHandler is required`,
                });
            }

            httpClient = this.authenticationHandler.buildClient(clientConfig);

        } else {
            httpClient = axios.create(clientConfig);
        }

        // error handling
        httpClient.interceptors.response.use(
            (response) => {
                // throw on API error response, regardless of status code
                this.throwOnResponseErrorData(response);
                return response;
            },
            (err) => {
                // log.error({ err, msg: "Problem in API post" });
                this.throwOnAxiosError(err);
            }
        )

        // TODO: enable request limit support
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
        if (withRetrySupport) {
            axiosRetry(httpClient, {
                retryDelay: this.customBackoff || this.calculateRetryDelay,
                shouldResetTimeout: this.shouldResetTimeout,
                retries: this.retryCount,
                retryCondition: (error: AxiosError) => {
                    const shouldRetry = axiosRetry.isNetworkOrIdempotentRequestError(error);
                    log.debug({
                        err: error.message,
                        msg: shouldRetry ? "retrying query" : "giving up on query",
                    });
                    return shouldRetry;
                },
            });

        }

        // cache client
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
            ? {
                endpoint: endpointOrParams,
                data,
                requiresAuthentication: true,
                withRetrySupport: true,
            }
            : endpointOrParams;

        // strip any preceding slash
        normalized.endpoint = normalized.endpoint
            .trim()
            .replace(/^\/+/, '');

        return normalized;
    }

    /**
     * 
     * @param err 
     */
    protected throwOnAxiosError(err: AxiosError): void {

        const message = err.message;
        const response = err.response;
        log.error({
            msg: "request failed", 
            request: err.request,
            response: response,
        });

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
