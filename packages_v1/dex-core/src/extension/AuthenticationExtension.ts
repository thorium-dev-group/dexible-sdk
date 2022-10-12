import { 
    APIClient, 
    APIExtensionProps,
    MarketingProps
} from 'dexible-common';

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

/**
 * IMPORTANT: Most methods below use the following settings:
 * - requiresAuthentication: false,
 * - withRetrySupport: false,
 * 
 * This is intentional, to prevent accidental recursion during login failures.
 */
export class AuthenticationExtension {

    client: APIClient;

    constructor(props: APIExtensionProps) {
        this.client = props.apiClient;
    }

    public async nonce(data: AuthNonceRequest): Promise<AuthNonceResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/nonce',
            requiresAuthentication: false,
            withRetrySupport: false,
        });

        return response;
    }

    public async register(data: AuthRegisterRequest): Promise<AuthRegisterResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/register',
            requiresAuthentication: false,
            withRetrySupport: false,
        });

        return response;
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
            withRetrySupport: false,
        });

        return response;
    }

    /**
     * Generate a new JWT session
     * Note: this does not invoke any configured JwtHandler!
     * @param data 
     * @returns 
     */
    public async login(data: AuthLoginRequest): Promise<AuthLoginResponse> {
        const response = await this.client.post({
            data,
            endpoint: 'auth/login',
            requiresAuthentication: false,
            withRetrySupport: false,
        });
        return response;
    }

    public async status(): Promise<AuthStatusResponse> {
        const response = await this.client.post({
            endpoint: 'auth/status',
            // requiresAuthentication is true, otherwise we would not be able to
            // validate the current authentication.
            requiresAuthentication: true,
            withRetrySupport: false,
        });
        return response;
    }
}
