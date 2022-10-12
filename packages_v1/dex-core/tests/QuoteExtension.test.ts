import { 
    QuoteExtension
} from '../src/extension/QuoteExtension'
import { ethers } from 'ethers';

const TIMEOUT = 10_000;

describe('TokenExtension', () => {
    it('should allow lookup without signer', async () => {
        expect.assertions(1);
      
        const mockGet = jest.fn((url) => true);
        const mockPost = jest.fn((url) => true);

        const apiClient : any = {
            get: mockGet,
            post: mockPost,
        } as const;

        const provider = ethers.providers.getDefaultProvider('homestead');

        const tokenIn = {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            decimals: 6,
            symbol: 'USDC',
        } as const;

        const tokenOut = {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimals: 18,
            symbol: 'WETH',
        } as const;

        const amountIn = ethers.utils.parseUnits('100', tokenIn.decimals);
        const slippagePercent = .005;

        const chainId = 1;
        const marketing = {};
        const gnosisSafe = undefined;
        const signer = undefined;

        const ext = new QuoteExtension({
            apiClient,
            chainId,
            marketing,
            provider,
            gnosisSafe,
            signer,
        });

        await ext.getQuote({
            tokenIn,
            tokenOut,
            amountIn,
            slippagePercent,
        });

        expect(mockPost.mock.calls.length).toBe(1);
        
    }, TIMEOUT)
})
