import axios, {AxiosAdapter} from 'axios';
import { EthHttpSignatureAxiosAdapter } from 'dexible-eth-http-signatures';
import {ethers} from 'ethers';
import Logger from 'dexible-logger';
import chainToName from '../chainToName';
import IJWTHandler from './IJWTHandler';
import SDKError from '../SDKError';

const log = new Logger({component: "APIClient"});

const DEFAULT_BASE_ENDPOINT = "api.dexible.io/v1";



export interface APIProps {
    signer: ethers.Signer;
    network: "ethereum"; //for now only support one network
    jwtHandler?: IJWTHandler;
    chainId: number;
}

export default class APIClient {
    signer: ethers.Signer;
    adapter: AxiosAdapter|null;
    network: "ethereum";
    chainId: number;
    chainName: string | null;
    baseUrl: string | null;
    jwtHandler: IJWTHandler | undefined;

    constructor(props:APIProps) {
        this.signer = props.signer;
        this.adapter = null; 
        this.network = props.network;
        this.chainId = props.chainId;
        this.chainName = chainToName(this.network, this.chainId);
        this.baseUrl = this._buildBaseUrl();
        this.jwtHandler = props.jwtHandler;
        log.debug("Created api client for chain", 
                this.chainName, 
                "on network", 
                this.network);
    }

    get = async (endpoint:string): Promise<any> => {
       
        let url = `${this.baseUrl}/${endpoint}`;
        log.debug("GET call to", url);
        
        try {

            let jwtToken:string|null = null;
            if(this.jwtHandler) {
                
                jwtToken = await this.jwtHandler.readToken();
                if(!jwtToken) {
                    
                    jwtToken = await this._generateToken(0);
                }
            } else if(!this.adapter) {
                this.adapter = await EthHttpSignatureAxiosAdapter.build(this.signer);
            }
        
            let r:any = null;
            if(jwtToken) {
                r = await axios({
                    method: "GET",
                    url: `${this.baseUrl}/auth/verify`,
                    headers: {
                        authorization: `Bearer ${jwtToken}`
                    }
                });
                if(!r.data.valid) {
                    log.debug("JWT no longer valid, generating new one");
                    //token is no longer valid, replace
                    jwtToken = await this._generateToken(0);
                }
                
                log.debug("GET w/JWT token");
                r = await axios({
                    method: "GET",
                    url,
                    headers: {
                        authorization: `Bearer ${jwtToken}`
                    }
                });
            } else {
                log.debug("GET w/signed header")
                r = await axios({
                    method: "GET",
                    url,
                    adapter: this.adapter||undefined
                });
            }

            if(!r.data) {
                throw new Error("Missing result in get request");
            }
            if(r.data.error) {
                log.debug("Problem reported from server", r.data.error);
                let msg = r.data.error.message;
                if(!msg) {
                    msg = r.data.error;
                }
                throw new SDKError({
                    message: msg,
                    requestId: r.data.error.requestId
                });
            }
            return r.data;
        } catch (e) {
            if(e.response && e.response.data) {
                let data = e.response.data;
                if(typeof e.response.data === 'string') {
                    data = JSON.parse(e.response.data);
                }
                log.error("Problem from server", data);
                let msg = data.message;
                let reqId = data.requestId;
                let code = data.code;
                throw new SDKError({
                    code,
                    message: msg,
                    requestId: reqId
                });
            }
            log.error("Problem in API client get request", e);
            throw e;
        }
    }

    post = async (endpoint:string, data:object|undefined) => {
       
        let url = `${this.baseUrl}/${endpoint}`;
        log.debug("Posting to url", url);
        
        try {
            let jwtToken:string|null = null;
            if(this.jwtHandler) {
                jwtToken = await this.jwtHandler.readToken();
                if(!jwtToken) {
                    jwtToken = await this._generateToken(0);
                }
            } else if(!this.adapter) {
                this.adapter = await EthHttpSignatureAxiosAdapter.build(this.signer);
            }

            let r:any = null;
            if(jwtToken) {
                log.debug("Posting w/JWT token");
                
                r = await axios({
                    method: "GET",
                    url: `${this.baseUrl}/auth/verify`,
                    headers: {
                        authorization: `Bearer ${jwtToken}`
                    }
                });

                if(!r.data.valid) {
                    log.debug("JWT is no longer valid, generating new one");
                    //token is no longer valid, replace
                    jwtToken = await this._generateToken(0);
                }

                r = await axios({
                    method: "POST",
                    url,
                    data,
                    headers: {
                        authorization: `Bearer ${jwtToken}`
                    }
                });
            } else {
                log.debug("Posting w/signed header");
                r =  await axios({
                    method: "POST",
                    url,
                    data,
                    adapter: this.adapter||undefined
                });
            }

            if(r.data && r.data.error) {
                let msg = r.data.error.message;
                if(!msg) {
                    msg = r.data.error;
                }
                log.error("Problem reported from server", r.data.error);
                throw new SDKError({
                    message: msg,
                    requestId: r.data.requestId
                });
            }
            return r.data;
        } catch (e) {
            if(e.response && e.response.data) {
                log.error("Problem from server", e.response.data);
                let data = e.response.data;
                let reqId = data.requestId;
                throw new SDKError({
                    message: data.message,
                    data: data.data,
                    requestId: reqId});
            }
            log.error({err: e}, "Problem in API post");
            throw e;
        }
    }

    _buildBaseUrl = () => {
        let base = process.env.API_BASE_URL;
        if(!base) {
            base = `https://${this.network}.${this.chainName}.${DEFAULT_BASE_ENDPOINT}`
        }
        return base;
    }

    _generateToken = async (count:number): Promise<string> => {
        try {
            log.debug("Generating JWTToken...");
            let url = `${this.baseUrl}/auth/nonce`;
            let address = await this.signer.getAddress();
            let r = await axios({
                method: "POST",
                url,
                data: {
                    address
                }
            });
            if(r.data.error) {
                log.error({err: r.data.error}, "Problem getting signing nonce");
                throw new SDKError({
                    message: r.data.error.message,
                    requestId: r.data.error.requestId
                });
            }
            
            let data:any = r.data;
            if(!data.canLogin) {
                if(count > 0) {
                    throw new Error("Could not get nonce on second attempt");
                }

                log.debug("Must first register wallet before login");
                //means we have to register first
                r = await axios({
                    method: "POST",
                    url: `${this.baseUrl}/auth/register`,
                    data: {
                        address
                    }
                });
                if(r.data.error) {
                    log.error({err: r.data.error}, "Problem registering user");
                    throw new SDKError({
                        message: r.data.error.message,
                        requestId: r.data.error.requestId
                    });
                }
                data = r.data;
            }

            if(!data.nonce || data.nonce.length === 0) {
                if(data.canLogin) {
                    log.debug("No nonce after nonce request, but can login, attempting to try again");
                    //try getting nonce again
                    return this._generateToken(1);
                }

                log.debug("Response w/out nonce", data);
                throw new Error("Response missing signing nonce");
            }
            log.debug("Have signable nonce for login...");
            let signature = await this.signer.signMessage(data.nonce);
            log.debug("Signed nonce, submitting for login");
            r = await axios({
                method: "POST",
                url: `${this.baseUrl}/auth/login`,
                data: {
                    signature,
                    address,
                    nonce: data.nonce
                }
            });
            if(r.data.error) {
                let err = r.data.error;
                let msg = err.message?err.message:err;
                let reqId = err.requestId;
                throw new SDKError({
                    message: msg,
                    requestId: reqId
                });
            }
            log.debug("Received token", r.data.token);
            await this.jwtHandler?.storeToken(r.data.token, r.data.expiration);
            return r.data.token;
        } catch (e) {
            if(e.response && e.response.data) {
                log.error("Problem from server", e.response.data);
                let data = e.response.data;
                let msg = data.message;
                let reqId = data.requestId;
                throw new SDKError({
                    message: msg,
                    requestId: reqId 
                });
            }
            throw e;
        }
    }

    
}