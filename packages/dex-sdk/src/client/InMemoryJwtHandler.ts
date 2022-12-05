import { IJWTHandler } from './IJWTHandler';

/**
 * This is an in-memory implementation of the IJWTHandler that simply keeps
 * the JWT data in memory.
 */
export class InMemoryJwtHandler implements IJWTHandler {
    token: string | null = null;
    expiration: number | null = null;

    async storeToken(token: string, expiration: number): Promise<void> {
        this.token = token;
        this.expiration = expiration;
    }

    async readToken(): Promise<string | null> {
        this.validate();
        return this.token;
    }


    protected validate() {
        if (this.expiration && Math.ceil(Date.now()/1000) > this.expiration) {
            this.expiration = null;
            this.token = null;
        }
    }
}
