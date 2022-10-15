import { APIClientFactory } from "../APIClientFactory";


export class AuthService {

    constructor(
        readonly chainId: number
    ) {}
    
    async nonce(request: AuthNonceRequest): Promise<AuthNonceResponse> {
        const client = APIClientFactory.instance.getClient(this.chainId);
        const response = await client.post({
            data: request,
            endpoint: 'auth/nonce',
            requiresAuthentication: false,
            withRetrySupport: false,
        });

        return response;
    }

    async login(request: AuthLoginRequest): Promise<AuthLoginResponse> {
        const client = APIClientFactory.instance.getClient(this.chainId);
        const response = await client.post({
            data: request,
            endpoint: 'auth/login',
            requiresAuthentication: false,
            withRetrySupport: false,
        });
        return response;
    }

    async register(request: AuthRegisterRequest): Promise<AuthRegisterResponse> {
        const client = APIClientFactory.instance.getClient(this.chainId);
        const response = await client.post({
            data: request,
            endpoint: 'auth/register',
            requiresAuthentication: false,
            withRetrySupport: false,
        });

        return response;
    }

    async status(): Promise<AuthStatusResponse> {
        const client = APIClientFactory.instance.getClient(this.chainId);
        const response = await  client.post({
            endpoint: 'auth/status',
            // requiresAuthentication is true, otherwise we would not be able to
            // validate the current authentication.
            requiresAuthentication: true,
            withRetrySupport: false,
        });
        return response;
    }

    async verify(request: AuthVerifyRequest): Promise<AuthVerifyResponse> {
        const client = APIClientFactory.instance.getClient(this.chainId);
        const response = await client.get({
            endpoint: '/auth/verify',
            headers: {
                authorization: `Bearer ${request.token}`
            },
            // Special case - we don't want to use the cached JWT Token, instead we want to explicitly
            // override with the supplied token. By setting requiresAuthentication == true, the built
            // in auth logic would override our token.
            requiresAuthentication: false,
            withRetrySupport: false,
        });

        return response;
    }
}

export type AuthVerifyResponse = {
    valid: boolean;
}


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