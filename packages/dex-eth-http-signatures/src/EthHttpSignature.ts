import EthMessageWrapper from "./EthMessageWrapper";
import {
    default as HttpSignature,
    HttpSignatureParams,
    HttpSignatureRequestProps,
} from "./HttpSignature";
import {ethers} from 'ethers';

export default class EthHttpSignature extends HttpSignature {


    async generateSignatureString(wallet: ethers.Wallet, requestProps : HttpSignatureRequestProps) : Promise<string> {
        
        // public key
        const keyId = await wallet.getAddress();

        // signature payload is assembled form of all headers being signed
        const signingString = HttpSignature.buildSigningStringFromRequest(requestProps);

        // It's common practice to wrap message signatures with a common
        // prefix to prevent users from accidentally pre-signing transactions
        const wrappedSigningString = EthMessageWrapper.wrap(signingString);

        const signature = await wallet.signMessage(wrappedSigningString);
    
        // build the fully formed signature string
        const signatureData : HttpSignatureParams = {
            keyId: keyId,
            algorithm: 'keccak-256',
            headers: requestProps.requiredHeaderFields.join(' '),
            signature
        };
        
        // assemble signature value that will be embedded in Authorization header
        const signatureLine = this.buildSignatureLine(signatureData);
        
        return signatureLine;
    }

    /**
     * Validate a signature against request props. Throws on failure
     * 
     * @throws Error
     * @param parsedSignatureFields 
     * @param requestProps 
     */
    async validate(parsedSignatureFields : HttpSignatureParams, requestProps : HttpSignatureRequestProps) : Promise<void> {
                
        HttpSignature.validateCommonFields(parsedSignatureFields, requestProps);

        if (! parsedSignatureFields.keyId) {
            throw new Error(`publicKey is required`);
        }
        
        // reconstruct signature payload from request
        const signingString = HttpSignature.buildSigningStringFromRequest(requestProps);

        const wrappedSigningString = EthMessageWrapper.wrap(signingString);

        // https://github.com/ethers-io/ethers.js/issues/447#issuecomment-519163178
        const recoveredAddress = ethers.utils.verifyMessage(wrappedSigningString, parsedSignatureFields.signature)
        if (! recoveredAddress) {
            throw new Error(`failed to recover address`);
        }

        if (recoveredAddress !== parsedSignatureFields.keyId) {
            throw new Error(`keyId does not match ${recoveredAddress} !== ${parsedSignatureFields.keyId}`);
        }
    }

}
