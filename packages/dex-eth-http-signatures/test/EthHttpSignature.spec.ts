import HttpDigest from '../src/HttpDigest';
import EthHttpSignature from "../src/EthHttpSignature";
import {ethers} from 'ethers';
import { HttpSignatureRequestProps } from '../src/HttpSignature';

describe('EthHttpSignature', () => {
    const mnemonic = 'test key '.repeat(5) + 'test able';
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const baseUrl = 'http://localhost:8080';
    const body = 'this.is.a.test.';
    const requestPropsPost : HttpSignatureRequestProps = {
        requestMethod: 'POST',
        requestUrl: baseUrl + '/',
        requiredHeaderFields: ['Date', 'Digest'],
        headers: {
            'Date': (new Date('December 17, 1995 03:24:00')).toISOString(),
            'Digest': HttpDigest.generateDigest(body),
        },
    }

    const requestPropsGetWithParamsInUrl : HttpSignatureRequestProps = {
        requestMethod: 'GET',
        requestUrl: baseUrl + '/search?z=foo&x=bar&y=',
        requiredHeaderFields: ['Date'],
        headers: {
            'Date': (new Date('December 17, 1995 03:24:00')).toISOString(),
        },
    }

    const requestPropsGetWithSeparateParams : HttpSignatureRequestProps = {
        requestMethod: 'GET',
        requestUrl: baseUrl + '/search',
        requestQueryParams: {
            z: 'foo',
            x: 'bar',
            y: undefined
        },
        requiredHeaderFields: ['Date'],
        headers: {
            'Date': (new Date('December 17, 1995 03:24:00')).toISOString(),
        },
    }
        
    const signer = new EthHttpSignature();
    
    it('POST - should return a signature string', async () => {
        
        const signature = await signer.generateSignatureString(wallet, requestPropsPost);

        expect(typeof signature).toBe('string');
    })

    it('POST - signature should be parsable', async () => {
        const address = await wallet.getAddress();
        const signature = await signer.generateSignatureString(wallet, requestPropsPost);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
        
        expect(parsedSignatureFields.keyId).toEqual(address);
    })

    it('POST - signature should validate', async () => {
        const address = await wallet.getAddress();
        const signature = await signer.generateSignatureString(wallet, requestPropsPost);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
    
        signer.validate(parsedSignatureFields, requestPropsPost);        
    });

    it('GET - signature should validate - params in url', async () => {
        const signature = await signer.generateSignatureString(wallet, requestPropsGetWithParamsInUrl);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
    
        signer.validate(parsedSignatureFields, requestPropsGetWithParamsInUrl);        
    });

    it('GET - signature should validate - separate params', async () => {
        const signature = await signer.generateSignatureString(wallet, requestPropsGetWithSeparateParams);

        const parsedSignatureFields = signer.parseSignatureLine(signature);
    
        signer.validate(parsedSignatureFields, requestPropsGetWithParamsInUrl);        
    });

    it('GET - signature should match - separate params / params in url', async () => {
        expect.assertions(1);

        const signatureWithParamsInUrl = await signer.generateSignatureString(
            wallet, 
            requestPropsGetWithParamsInUrl
        );

        const signatureWithSeparateParams = await signer.generateSignatureString(
            wallet, 
            requestPropsGetWithSeparateParams
        );

        expect(signatureWithParamsInUrl)
            .toEqual(signatureWithSeparateParams);    
    });

    test.todo('should conform to http-signature spec');
    // Any parameter that is not recognized as a parameter, or
    // is not well-formed, MUST be ignored.

    // The `created` field expresses when the signature was
    //    created.  The value MUST be a Unix timestamp integer value.  A
    //    signature with a `created` timestamp value that is in the future MUST
    //    NOT be processed.

    // keyId
    //    REQUIRED.  The `keyId` field is an opaque string that the server can
    //    use to look up the component they need to validate the signature.

    // signature
    //    REQUIRED.  The `signature` parameter is a base 64 encoded digital
    //    signature, as described in RFC 4648 [RFC4648], Section 4 [5].  The
    //    client uses the `algorithm` and `headers` Signature Parameters to
    //    form a canonicalized `signing string`. This `signing string` is then
    //    signed using the key associated with the `keyId` according to its
    //    digital signature algorithm.  The `signature` parameter is then set
    //    to the base 64 encoding of the signature.


    // expires
    //    OPTIONAL.  The `expires` field expresses when the signature ceases to
    //    be valid.  The value MUST be a Unix timestamp integer value.  A
    //    signature with an `expires` timestamp value that is in the past MUST
    //    NOT be processed.  Using a Unix timestamp simplifies processing and
    //    avoid timezone management existing in RFC3339.  Subsecod precision is
    //    allowed using decimal notation.


    // headers

    //    OPTIONAL.  The `headers` parameter is used to specify the list of
    //    HTTP headers included when generating the signature for the message.
    //    If specified, it SHOULD be a lowercased, quoted list of HTTP header
    //    fields, separated by a single space character.  If not specified,
    //    implementations MUST operate as if the field were specified with a
    //    single value, `(created)`, in the list of HTTP headers.  Note:

    //    1.  The list order is important, and MUST be specified in the order
    //        the HTTP header field-value pairs are concatenated together
    //        during Signature String Construction (Section 2.3) used during
    //        signing and verifying.

    //    2.  A zero-length `headers` parameter value MUST NOT be used, since
    //        it results in a signature of an empty string.


    // Ambiguous Parameters
    //    If any of the parameters listed above are erroneously duplicated in
    //    the associated header field, then the the signature MUST NOT be
    //    processed.  Any parameter that is not recognized as a parameter, or
    //    is not well-formed, MUST be ignored.


    // To include the HTTP request target in the signature calculation, use
    // the special `(request-target)` header field name.  To include the
    // signature creation time, use the special `(created)` header field
    // name.  To include the signature expiration time, use the special
    // `(expires)` header field name.

    // 1.  If the header field name is `(request-target)` then generate the
    //     header field value by concatenating the lowercased :method, an
    //     ASCII space, and the :path pseudo-headers (as specified in
    //     HTTP/2, Section 8.1.2.3 [7]).  Note: For the avoidance of doubt,
    //     lowercasing only applies to the :method pseudo-header and not to
    //     the :path pseudo-header.

    // 2.  If the header field name is `(created)` and the `algorithm`
    //     parameter starts with `rsa`, `hmac`, or `ecdsa` an implementation
    //     MUST produce an error.  If the `created` Signature Parameter is
    //     not specified, or is not an integer, an implementation MUST
    //     produce an error.  Otherwise, the header field value is the
    //     integer expressed by the `created` signature parameter.





    // Cavage & Sporny          Expires April 22, 2020                 [Page 7]

    // Internet-Draft            Signing HTTP Messages             October 2019


    // 3.  If the header field name is `(expires)` and the `algorithm`
    //     parameter starts with `rsa`, `hmac`, or `ecdsa` an implementation
    //     MUST produce an error.  If the `expires` Signature Parameter is
    //     not specified, or is not an integer, an implementation MUST
    //     produce an error.  Otherwise, the header field value is the
    //     integer expressed by the `created` signature parameter.

});
