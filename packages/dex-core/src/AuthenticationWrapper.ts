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

    baseUrl: string;
    client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
        if (!client.baseUrl) {
            throw new Error(``);
        }
        this.baseUrl = client.baseUrl;
    }

    public async nonce(props: AuthNonceRequest): Promise<AuthNonceResponse> {
        const url = `${this.baseUrl}/auth/nonce`;

        const response = await this.client.post(
            url,
            props
        );

        return response.data;
    }

    public async register(props: AuthRegisterRequest): Promise<AuthRegisterResponse> {
        const response = await this.client.post(
            `${this.baseUrl}/auth/register`,
            props
        );

        return response.data;
    }

    public async verify(props: AuthVerifyRequest): Promise<AuthVerifyResponse> {
        const {
            token
        } = props;

        const response = await this.client.get({
            endpoint: `/auth/verify`,
            // Special case - we don't want to use the cached JWT Token, instead we want to explicitly
            // override with the supplied token. By setting requiresAuthentication == true, the built
            // in auth logic would override our token.
            requiresAuthentication: false,
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        return response.data;
    }

    public async login(props: AuthLoginRequest): Promise<AuthLoginResponse> {
        const response = await this.client.post(
            `${this.baseUrl}/auth/login`,
            props
        );
        return response.data;
    }

    public async status(): Promise<AuthStatusResponse> {
        const response = await this.client.post(
            `${this.baseUrl}/auth/status`,
        );
        return response.data;
    }
}
