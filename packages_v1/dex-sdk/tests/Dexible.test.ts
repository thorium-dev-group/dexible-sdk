import { Dexible } from '../src/index';
import { ethers } from 'ethers';

describe('Dexible', () => {

    it('should allow overriding signer provider', async () => {
        expect.assertions(2);
        
        // setup sdk that will inherit provider from signer instance
        const defaultProvider = new ethers.providers.InfuraProvider('homestead');
        const randomWallet = ethers.Wallet.createRandom();
        const signer = await randomWallet.connect(defaultProvider);

        const dexible1 = await Dexible.connect({
            signer
        });

        expect(dexible1.sdk.provider).toBe(defaultProvider);

        // setup sdk that will override the signer's provider with custom
        const customProvider = new ethers.providers.PocketProvider('homestead');

        const dexible2 = await Dexible.connect({
            signer,
            provider: customProvider,
        });

        expect(dexible2.sdk.provider).not.toBe(defaultProvider);
    });
})
