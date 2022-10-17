
/**
 * This interface is provided to handle storing and retrieving JWT data for 
 * authentication.
 */
export interface IJWTHandler {
    storeToken: (token:string, expiration: number) => Promise<void>;
    readToken: () => Promise<string|null>;
}
