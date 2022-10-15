
export interface IJWTHandler {
    storeToken: (token:string, expiration: number) => Promise<void>;
    readToken: () => Promise<string|null>;
}
