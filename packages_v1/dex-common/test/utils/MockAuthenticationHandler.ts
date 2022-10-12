import { IAuthenticationHandler } from '../../src/services//IAuthenticationHandler';
import { default as axios, AxiosInstance, AxiosRequestConfig } from 'axios';

export class MockAuthenticationHandler implements IAuthenticationHandler {


    constructor() {
    }

    buildClient(clientConfig : Partial<AxiosRequestConfig>) : AxiosInstance{
        return axios.create(clientConfig);
    }

    async authenticate() { 
    }
}
