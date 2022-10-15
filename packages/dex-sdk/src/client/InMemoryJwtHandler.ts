import { IJWTHandler } from './IJWTHandler';

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
        if (this.expiration && Date.now() > this.expiration) {
            this.expiration = null;
            this.token = null;
        }
    }
}
