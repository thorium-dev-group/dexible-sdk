import axios, {AxiosAdapter} from 'axios';
import { EthHttpSignatureAxiosAdapter } from 'dex-eth-http-signatures';
import {ethers} from 'ethers';
import Logger from 'dex-logger';
import chainToName from '../chainToName';

const log = new Logger({component: "APIClient"});

const DEFAULT_BASE_ENDPOINT = "api.dexible.io/vi";

export interface APIProps {
    signer: ethers.Signer;
    network: "ethereum"; //for now only support one network
    chainId: number;
}

export default class APIClient {
    signer: ethers.Signer;
    adapter: AxiosAdapter|null;
    network: "ethereum";
    chainId: number;
    chainName: string;
    baseUrl: string;

    constructor(props:APIProps) {
        this.signer = props.signer;
        this.adapter = null; 
        this.network = props.network;
        this.chainId = props.chainId;
        this.chainName = chainToName(this.network, this.chainId);
        this.baseUrl = this._buildBaseUrl();
        log.debug("Created api client for chain", 
                this.chainName, 
                "on network", 
                this.network);
    }

    get = async (endpoint:string): Promise<any> => {
        let url = `${this.baseUrl}/${endpoint}`;
        log.debug("GET call to", url);
        

        try {


            if(!this.adapter) {
                this.adapter = await EthHttpSignatureAxiosAdapter.build(this.signer);
            }
        
            let r = await axios({
                method: "GET",
                url,
                adapter: this.adapter
            });
            if(!r.data) {
                throw new Error("Missing result in get request");
            }
            if(r.data.error) {
                log.debug("Problem reported from server", r.data.error);
                let msg = r.data.error.message;
                if(!msg) {
                    msg = r.data.error;
                }
                throw new Error(msg);
            }
            return r.data;
        } catch (e) {
            if(e.response && e.response.data) {
                log.error("Problem from server", e.response.data);
                throw new Error(e.response.data.message);
            }
            log.error("Problem in API client get request", e);
            throw e;
        }
    }

    post = async (endpoint:string, data:object|undefined) => {
        let url = `${this.baseUrl}/${endpoint}`;
        log.debug("Posting to url", url);
        
        try {
            if(!this.adapter) {
                this.adapter = await EthHttpSignatureAxiosAdapter.build(this.signer);
            }

            let r = await axios({
                method: "POST",
                url,
                data,
                adapter: this.adapter
            });
            if(r.data && r.data.error) {
                let msg = r.data.error.message;
                if(!msg) {
                    msg = r.data.error;
                }
                log.error("Problem reported from server", r.data.error);
                throw new Error(msg);
            }
            return r.data;
        } catch (e) {
            if(e.response && e.response.data) {
                log.error("Problem from server", e.response.data);
                throw new Error(e.response.data.message);
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
    
}