import { 
    TokenExtension
} from '../src/extension/TokenExtension'
import { ethers, BigNumber } from 'ethers';

const TIMEOUT = 30_000;
const ZERO = BigNumber.from(0);

describe('TokenExtension', () => {
    it('should allow lookup without signer', async () => {
        expect.assertions(7);
      
        const mockGet = jest.fn((url) => true);

        const apiClient : any = {
            get: mockGet
        } as const;

        const provider = ethers.providers.getDefaultProvider('homestead');

        // USDC
        const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

        const chainId = 1;
        const marketing = {};
        const gnosisSafe = undefined;
        const signer = undefined;

        const ext = new TokenExtension({
            apiClient,
            chainId,
            marketing,
            provider,
            gnosisSafe,
            signer,
        });

        const response = await ext.lookup(tokenAddress);

        expect(mockGet.mock.calls.length).toBe(1);

        expect(response.address.toLowerCase())
            .toEqual(tokenAddress.toLowerCase());

        expect(response.allowance).toStrictEqual(ZERO);

        expect(response.balance).toStrictEqual(ZERO);

        expect(response.decimals).toBe(6);
        
        expect(response.symbol).toBe('USDC');

        // not currently fetching token name
        // expect(response.name).toBe('USD Coin');
        expect(response.name).toBeUndefined();
    }, TIMEOUT)
})
