import { APIClient } from 'dexible-common';

export type GetGasPricesRequest = {
    chainId: number;
}

export type GetGasPricesResponse = {
    safe: number;
    recommended: number;
    fast: number;
}

export class GasPriceWrapper {

    client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
    }

    public async getGasPrices(
        params: GetGasPricesRequest
    ): Promise<GetGasPricesResponse> {

        const { chainId } = params;
        if (typeof chainId !== 'number') {
            throw new Error(`chainId must be a number`);
        }

        if(Number.isInteger(chainId) == false || Math.sign(chainId) !== 1) {
            throw new Error(`chainId must be a positive integer`);
        }

        const response = await this.client.get({
            endpoint: '/gas/' + encodeURIComponent(chainId),
            requiresAuthentication: false,
            withRetrySupport: true,
        });

        return response;
    }

}
