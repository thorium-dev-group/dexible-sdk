import { default as axios, AxiosAdapter, AxiosRequestConfig } from 'axios';
import { ethers } from 'ethers';
import { EthHttpSignature, HttpDigest } from '.';
import { URL } from 'url';
import Logger from 'dex-logger';

const log = new Logger({component: "EthHttpSignatureAxiosAdapter"});

export default class EthHttpSignatureAxiosAdapter {

    static  build(wallet: ethers.Wallet): AxiosAdapter {

        const httpSignature = new EthHttpSignature();

        const defaultAdapter = axios.create().defaults.adapter
        if (! defaultAdapter) {
            throw new Error(`Unable to determine default adapter`);
        }

        // custom adapter that wraps the original adapter.
        // responsible for mixing in auth / digest headers
        return async (config: AxiosRequestConfig) => {

            if (! axios.defaults.adapter) {
                throw new Error('')
            }

            const originalHeaders = config.headers || {}
            const additionalHeaders = {};
    
            // Add Date header
            if (! ('Date' in originalHeaders)) {
                additionalHeaders['Date'] = (new Date()).toISOString();
            }

            // Add Digest header
            if (config.data) {
                const digest = HttpDigest.generateDigest(config.data);
                additionalHeaders['Digest'] = digest;  
            }

            // add signature auth header
            const requestUrl = new URL(config.url || '/')
            const requestProps = {
                urlPath: requestUrl.pathname + requestUrl.search,
                requestMethod: (config.method || 'GET').toUpperCase(),
                requiredHeaderFields: Object.keys(additionalHeaders),
                headers: {
                    ...originalHeaders,
                    ...additionalHeaders,
                },
            };
        
            const signature = await httpSignature.generateSignatureString(wallet, requestProps);
            additionalHeaders['Authorization'] = signature;
        
            // set request headers
            for(const [key, value] of Object.entries(additionalHeaders)) {
                config.headers[key] = value;
            }

            log.debug("Adding Axios headers", config);

            // call original adapter
            return defaultAdapter(config);
        }

    }


}
