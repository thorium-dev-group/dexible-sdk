import { SDK } from '../src/index';
import { ethers } from 'ethers';

describe('SDK', () => {

    it('should allow overriding signer provider', async () => {
        expect.assertions(2);
        
        // setup sdk that will inherit provider from signer instance
        const defaultProvider = new ethers.providers.InfuraProvider('homestead');
        const randomWallet = ethers.Wallet.createRandom();
        const signer = await randomWallet.connect(defaultProvider);

        const sdk1 = await SDK.create({
            signer
        });

        expect(sdk1.provider).toBe(defaultProvider);

        // setup sdk that will override the signer's provider with custom
        const customProvider = new ethers.providers.PocketProvider('homestead');

        const sdk2 = await SDK.create({
            signer,
            provider: customProvider,
        });

        expect(sdk2.provider).not.toBe(defaultProvider);
    });
})
