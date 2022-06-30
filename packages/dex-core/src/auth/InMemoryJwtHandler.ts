import { IJWTHandler } from 'dexible-common';

export class InMemoryJwtHandler implements IJWTHandler {
    token: string | null = null;

    async storeToken(token: string, expiration: number): Promise<void> {
        this.token = token;
    }

    async readToken(): Promise<string | null> {
        return this.token;
    }
}
