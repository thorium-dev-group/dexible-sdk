import { default as axios, AxiosAdapter, AxiosRequestConfig } from 'axios';
import { ethers } from 'ethers';
import { EthHttpSignature, HttpDigest } from '.';
import Logger from '../logger';
import { HttpSignatureRequestProps } from './HttpSignature';
import { extractUrlPath } from './utils';

const log = new Logger({ component: "EthHttpSignatureAxiosAdapter" });

export default class EthHttpSignatureAxiosAdapter {

    static build(signer: ethers.Signer): AxiosAdapter {

        const httpSignature = new EthHttpSignature();

        const defaultAdapter = axios.create().defaults.adapter
        if (!defaultAdapter) {
            throw new Error(`Unable to determine default adapter`);
        }

        // custom adapter that wraps the original adapter.
        // responsible for mixing in auth / digest headers
        return async (config: AxiosRequestConfig) => {

            if (!axios.defaults.adapter) {
                throw new Error('Failed to load default axios adapter')
            }

            const originalHeaders = config.headers || {}
            const additionalHeaders = {};

            // Add Date header
            // cannot set Date header in browser, use alt header name.
            additionalHeaders['X-Signature-Date'] = (new Date()).toISOString();

            // Add Digest header
            if (config.data) {
                const digest = HttpDigest.generateDigest(config.data);
                additionalHeaders['Digest'] = digest;
            }

            const requestUrl = config.url || config.baseURL;
            if (!requestUrl) {
                throw new Error(`url or baseUrl is required`);
            }

            const requestPath = extractUrlPath(requestUrl) || '';
            
            const requestQueryParams: {
                [key: string]: string
            } = {};

            // Axios may return undefined for params
            if (config.params) {
                for (const key of Object.keys(config.params)) {
                    const value = config.params[key];
                    // Axios drops any params with a `undefined` value from the final
                    // request. If we don't do the same, our signatures will not match
                    // on the server side.
                    if (value !== null && value !== undefined) {
                        // convert value to string, on the server side we will
                        // reconstruct the signing payload before any type coercion
                        // is applied to query params.
                        requestQueryParams[key] = `${value}`;
                    }
                }
            }

            // add signature auth header
            const requestProps: HttpSignatureRequestProps = {
                requestPath,
                requestQueryParams,
                requestMethod: (config.method || 'GET').toUpperCase(),
                requiredHeaderFields: Object.keys(additionalHeaders),
                headers: {
                    ...originalHeaders,
                    ...additionalHeaders,
                },
            };

            const signature = await httpSignature.generateSignatureString(signer, requestProps);
            additionalHeaders['Authorization'] = signature;

            // set request headers
            for (const [key, value] of Object.entries(additionalHeaders)) {
                config.headers[key] = value;
            }

            log.debug("Adding Axios headers", config);

            // call original adapter
            return defaultAdapter(config);
        }

    }


}
