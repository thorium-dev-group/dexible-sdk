import { APIClient, MarketingProps } from 'dexible-common';

// /auth/nonce
export type AuthNonceRequest = {
    address: string;
}

export type AuthNonceResponse = {
    nonce: string;
    canLogin: boolean;
}

// /auth/register
export type AuthRegisterRequest = {
    address: string;
    marketing?: MarketingProps;
}

export type AuthRegisterResponse = {
    nonce: string;
    canLogin: boolean;
}

// /auth/login
export type AuthLoginRequest = {
    expiresInSeconds?: number;
    signature: string;
    address: string;
    nonce: string;
}

export type AuthLoginResponse = {
    user: any;
    token: string;
    expiration: number;
}

// /auth/status
export type AuthStatusResponse = {
    authenticated: boolean;
    authenticationMethod: 'jwt' | 'signature';
    publicAddress: string;
}

// /auth/verify
export type AuthVerifyRequest = {
    token: string;
}

export type AuthVerifyResponse = {
    valid: boolean;
}

export class AuthenticationWrapper {

    client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
    }

    public async nonce(data: AuthNonceRequest): Promise<AuthNonceResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/nonce',
            requiresAuthentication: true,
            withRetrySupport: false,
        });

        return response.data;
    }

    public async register(data: AuthRegisterRequest): Promise<AuthRegisterResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/register',
            requiresAuthentication: true,
            withRetrySupport: false,
        });

        return response.data;
    }

    public async verify(data: AuthVerifyRequest): Promise<AuthVerifyResponse> {
        const response = await this.client.get({
            endpoint: '/auth/verify',
            headers: {
                authorization: `Bearer ${data.token}`
            },
            // Special case - we don't want to use the cached JWT Token, instead we want to explicitly
            // override with the supplied token. By setting requiresAuthentication == true, the built
            // in auth logic would override our token.
            requiresAuthentication: false,
            withRetrySupport: true,
        });

        return response.data;
    }

    public async login(data: AuthLoginRequest): Promise<AuthLoginResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/login',
            requiresAuthentication: true,
            withRetrySupport: true,
        });
        return response.data;
    }

    public async status(): Promise<AuthStatusResponse> {
        const response = await this.client.post({
            endpoint: 'auth/status',
            requiresAuthentication: true,
            withRetrySupport: true,
        });
        return response.data;
    }
}
