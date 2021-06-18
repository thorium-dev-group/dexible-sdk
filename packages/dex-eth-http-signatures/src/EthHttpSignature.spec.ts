import {expect} from 'chai';
import HttpDigest from './HttpDigest';
import EthHttpSignature from "./EthHttpSignature";
import {ethers} from 'ethers';

describe('#generateSignature()', () => {
    const mnemonic = 'test key '.repeat(5) + 'test able';
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    
    const requestMethod = 'POST';
    const urlPath = '/';
    const body = 'this.is.a.test.'
    
    const requiredHeaderFields = ['Date', 'Digest'];
    const headers = {
        'Date': (new Date('December 17, 1995 03:24:00')).toISOString(),
    }
    
    const digest = HttpDigest.generateDigest(body);
    headers['Digest'] = digest;

    const requestProps = {
        requestMethod,
        urlPath,
        headers,
        requiredHeaderFields,
    }

    const signer = new EthHttpSignature();
    
    it('should return a signature string', async () => {
        
        const signature = await signer.generateSignatureString(wallet, requestProps);

        expect(signature).to.be.a('string');
    })

    it('signature should be parsable', async () => {
        const address = await wallet.getAddress();
        const signature = await signer.generateSignatureString(wallet, requestProps);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
        
        expect(parsedSignatureFields.keyId).to.equal(address);
    })

    it('signature should validate', async () => {
        const address = await wallet.getAddress();
        const signature = await signer.generateSignatureString(wallet, requestProps);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
    
        signer.validate(parsedSignatureFields, requestProps);        
    });
});
